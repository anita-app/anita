import { useState, type FC, type FormEvent } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { WordPressAuth } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { WordPressApiError, WordPressErrorCode, getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import { WORDPRESS_PLUGIN_NAME, WORDPRESS_PLUGIN_URL } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import { Icons } from 'app/libs/icons/icons.class'

export const getConnectionErrorMessage = (error: unknown, siteUrl: string): string => {
  const host = siteUrl.replace(/^https?:\/\//, '')
  const apiError = WordPressApiError.from(error)
  switch (apiError.code) {
    case WordPressErrorCode.network:
      return `Anita could not reach the ${WORDPRESS_PLUGIN_NAME} plugin on ${host}. Check that the address is correct and the site is online, that the plugin is installed and active, and that the WordPress REST API is not blocked by a security plugin or a firewall.`
    case WordPressErrorCode.pluginMissing:
      return `${host} is a WordPress site, but the ${WORDPRESS_PLUGIN_NAME} plugin is not active. Install and activate it, then try again.`
    case WordPressErrorCode.originNotAllowed:
      return `${host} does not accept connections from this address of Anita (${WordPressAuth.getReturnUrl()}). An administrator of the site can add it in Settings → Anita → Allowed app URLs.`
    default:
      return getWordPressErrorMessage(apiError, host)
  }
}

/**
 * Setup checklist and form to connect a WordPress site.
 */
export const ConnectWordPress: FC = () => {
  const [siteUrl, setSiteUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!siteUrl.trim()) {
      setError('Enter the address of your WordPress site, for example https://example.com')
      return
    }
    const normalizedUrl = WordPressAuth.normalizeSiteUrl(siteUrl)
    setError(null)
    setIsChecking(true)
    try {
      const site = await WordPressAuth.checkSite(normalizedUrl)
      // Leaves the app: the site sends the user back when the login is complete.
      await WordPressAuth.startLogin(site)
    } catch (connectionError) {
      setError(getConnectionErrorMessage(connectionError, normalizedUrl))
      setIsChecking(false)
    }
  }

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-start gap-4">
        <span className="ui-avatar w-11 h-11 rounded-xl text-xl">{Icons.render('logoWordpress')}</span>
        <div className="min-w-0">
          <h2 className="ui-title text-lg">Connect a WordPress site</h2>
          <p className="text-sm text-[#5b6b80] mt-0.5">Store your projects on your own WordPress site and share them with its users. Each user logs in with their WordPress account.</p>
        </div>
      </div>

      <ol className="grid gap-2.5 sm:grid-cols-3 my-5">
        <li className="ui-field flex gap-3 text-sm text-[#33445a]">
          <span className="ui-step">1</span>
          <span>
            On your WordPress site, install and activate the
            {' '}
            <a
              href={WORDPRESS_PLUGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#006fdf] underline underline-offset-2"
            >
              {WORDPRESS_PLUGIN_NAME}
            </a>
            {' '}
            plugin (Plugins → Add New).
          </span>
        </li>
        <li className="ui-field flex gap-3 text-sm text-[#33445a]">
          <span className="ui-step">2</span>
          <span>Enter the address of the site below and click Connect.</span>
        </li>
        <li className="ui-field flex gap-3 text-sm text-[#33445a]">
          <span className="ui-step">3</span>
          <span>Log in with your WordPress account and approve the connection: you will be brought back here.</span>
        </li>
      </ol>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 sm:items-center"
      >
        <label
          htmlFor="wordpressSiteUrl"
          className="sr-only"
        >
          Site address
        </label>
        <input
          id="wordpressSiteUrl"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://example.com"
          value={siteUrl}
          onChange={(event) => setSiteUrl(event.target.value)}
          className={`${FORM_ELEMENTS_CSS_CLASSES} grow px-3 py-2 text-sm`}
          disabled={isChecking}
        />
        <Button
          id="connectWordPress"
          label={isChecking ? 'Checking the site…' : 'Connect'}
          iconLeft="logoWordpress"
          type={Type.primary}
          onClick={() => handleSubmit()}
          disabled={isChecking}
          marginClassName=""
        />
      </form>

      {error && (
        <div className="mt-4">
          <AlertWithDescription
            title="The site cannot be connected yet"
            description={error}
            type={Type.warning}
          />
        </div>
      )}

      <p className="text-xs text-[#7a8799] mt-4">The plugin works with any permalink setting. Your data is stored in the database of your site; Anita keeps a copy on this device so you can also work offline.</p>
    </div>
  )
}
