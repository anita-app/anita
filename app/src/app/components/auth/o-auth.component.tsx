import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Icons } from 'app/libs/icons/icons.class'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { SupportedCloud } from 'app/cross-refs-exports'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { OAuthUtils } from 'app/libs/cloud-sync/o-auth-utils.class'
import { WordPressAuth, type ICompletedLogin } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { Navigate } from 'react-router-dom'
import { useEffect, useState, type FC, type ReactNode } from 'react'

/**
 * Codes already handled: the auth route can render more than once with the same URL.
 */
const handledCodes = new Set<string>()

const onClick = () => {
  window.close()
}

const AuthCard: FC<{ subtitle: string; title: string; children?: ReactNode }> = (props) => (
  <div className="container px-0 md:px2 lg:px-5 pt-20 md:pt-24 mx-auto">
    <div className="p-4 lg:w-2/3 mx-auto">
      <div className="ui-card ui-rise h-full px-8 pt-14 pb-14 overflow-hidden text-center relative">
        <span className="ui-avatar w-14 h-14 rounded-2xl text-2xl mx-auto mb-5">{Icons.render('logoWordpress')}</span>
        <h2 className="ui-eyebrow mb-1">{props.subtitle}</h2>
        <h1 className="ui-title sm:text-2xl text-xl mb-3">{props.title}</h1>
        {props.children}
      </div>
    </div>
  </div>
)

interface IWordPressAuthState {
  status: 'working' | 'done' | 'error' | 'confirmSwitch'
  message?: string
  siteName?: string
  login?: ICompletedLogin
}

const finishLogin = async (login: ICompletedLogin, setState: (state: IWordPressAuthState) => void) => {
  await login.commit()
  if (login.linkProjectId) {
    await WordPressSync.linkProject(login.linkProjectId, login.remoteId, login.linkAccessLevel)
    // Without view transition: the page is still updating after the login.
    RoutingState.navigate(urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: login.linkProjectId }]))
    return
  }
  setState({ status: 'done', siteName: login.siteName })
  WordPressSync.syncRemote(login.remoteId)
}

const WordPressAuthResult: FC<{ code?: string; error?: string }> = (props) => {
  const [state, setState] = useState<IWordPressAuthState>(() => (
    props.error
      ? { status: 'error', message: props.error === 'access_denied' ? 'The connection was cancelled on the WordPress site.' : 'The WordPress site did not complete the connection.' }
      : { status: 'working' }
  ))

  useEffect(() => {
    if (props.error) {
      WordPressAuth.clearPendingLogin()
      return
    }
    if (!props.code || handledCodes.has(props.code)) {
      return
    }
    handledCodes.add(props.code)

    const complete = async () => {
      let siteName = 'the site'
      try {
        const login = await WordPressAuth.completeLogin(props.code!)
        siteName = login.siteName
        if (login.previousUserName) {
          setState({ status: 'confirmSwitch', siteName, login })
          return
        }
        await finishLogin(login, setState)
      } catch (error) {
        setState({ status: 'error', message: getWordPressErrorMessage(error, siteName) })
      }
    }
    complete()
  }, [props.code, props.error])

  if (state.status === 'working') {
    return (
      <AuthCard
        subtitle="WordPress"
        title="Connecting…"
      >
        <Loader />
      </AuthCard>
    )
  }

  if (state.status === 'confirmSwitch' && state.login) {
    const login = state.login
    const handleContinue = () => {
      setState({ status: 'working' })
      finishLogin(login, setState).catch(error => setState({ status: 'error', message: getWordPressErrorMessage(error, login.siteName) }))
    }
    return (
      <AuthCard
        subtitle="WordPress"
        title={`Switch account on ${login.siteName}?`}
      >
        <p className="leading-relaxed mb-3">This device was connected to {login.siteName} as {login.previousUserName}, and you have now logged in as {login.userName}.</p>
        <p className="leading-relaxed mb-3">If you continue, projects of {login.previousUserName} that {login.userName} cannot access will be removed from this device. They are not deleted from {login.siteName}.</p>
        <div className="flex justify-center flex-wrap gap-y-2">
          <Button
            id="cancelSwitch"
            label="Cancel"
            type={Type.secondary}
            size="lg"
            href={ANITA_URLS.remotes}
            marginClassName="mt-4 mr-3"
          />
          <Button
            id="confirmSwitch"
            label={`Continue as ${login.userName}`}
            type={Type.primary}
            size="lg"
            onClick={handleContinue}
            marginClassName="mt-4"
          />
        </div>
      </AuthCard>
    )
  }

  if (state.status === 'error') {
    return (
      <AuthCard
        subtitle="WordPress"
        title="The connection did not complete"
      >
        <p className="leading-relaxed mb-3">{state.message}</p>
        <div className="flex justify-center">
          <Button
            id="backToRemotes"
            label="Back to WordPress sites"
            type={Type.primary}
            size="lg"
            href={ANITA_URLS.remotes}
            marginClassName="mt-4"
          />
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      subtitle="Authentication successful"
      title={`${state.siteName} connected`}
    >
      <p className="leading-relaxed mb-3">Your projects on {state.siteName} are being downloaded to this device. To sync a project of this device with {state.siteName}, choose it as remote storage in the project settings.</p>
      <div className="flex justify-center flex-wrap gap-y-2">
        <Button
          id="goToRemotes"
          label="WordPress sites"
          type={Type.secondary}
          size="lg"
          href={ANITA_URLS.remotes}
          marginClassName="mt-4 mr-3"
        />
        <Button
          id="goToProjects"
          label="Go to projects list"
          type={Type.primary}
          size="lg"
          href={ANITA_URLS.projectsList}
          marginClassName="mt-4"
        />
      </div>
    </AuthCard>
  )
}

const DropboxAuthResult: FC<{ code: string }> = (props) => {
  useEffect(() => {
    DropboxHelper.instance.getAccessTokenFromCode(props.code)
  }, [props.code])

  return (
    <AuthCard
      subtitle="Authentication successful"
      title="Dropbox connected"
    >
      <p className="leading-relaxed mb-3">You can close this window and go back to Anita.</p>
      <div className="flex justify-center">
        <Button
          id="close"
          label="Close"
          type={Type.primary}
          size="lg"
          onClick={onClick}
          marginClassName="mt-4"
        />
      </div>
    </AuthCard>
  )
}

export const OAuth: FC = () => {
  const data = OAuthUtils.parseQueryString()
  const service = data.service ?? SupportedCloud.DROPBOX

  if (service === SupportedCloud.WORDPRESS) {
    return (
      <WordPressAuthResult
        code={data.code ?? undefined}
        error={data.error ?? undefined}
      />
    )
  }

  if (!data?.code) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  return <DropboxAuthResult code={data.code} />
}
