/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { SupportedCloud } from 'app/cross-refs-exports'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { OAuthUtils } from 'app/libs/cloud-sync/o-auth-utils.class'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { RoutingState } from 'app/state/routing/routing-state.class'
import React from 'react'
import { Navigate } from 'react-router-dom'

const onClick = () => {
  window.close()
}

export const OAuth: React.FC = () => {
  const data = OAuthUtils.parseQueryString()

  const code = data.code
  const service = data.service ?? SupportedCloud.DROPBOX
  const label = service === SupportedCloud.WORDPRESS ? 'WordPress' : 'Dropbox'
  const helper = React.useMemo(() => (service === SupportedCloud.WORDPRESS ? WordpressHelper.instance : DropboxHelper.instance), [service])

  React.useEffect(() => {
    helper.getAccessTokenFromCode(code)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, helper])

  if (!data?.code) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  const goToProjectsList = () => {
    RoutingState.goTo(ANITA_URLS.projectsList)
  }

  return (
    <div className="container px-0 md:px2 lg:px-5 pt-20 md:pt-24 mx-auto">
      <div className="p-4 lg:w-2/3 mx-auto">
        <div className="h-full bg-white shadow px-8 pt-16 pb-16 rounded-lg overflow-hidden text-center relative">
          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">Authentication successful</h2>
          <h1 className="title-font sm:text-2xl text-xl font-medium text-gray-900 mb-3">{label} connected</h1>
          <p className="leading-relaxed mb-3">You can close this window and go back to Anita.</p>
          <div className="flex justify-center">
            <Button
              id="close"
              label={service === SupportedCloud.WORDPRESS ? 'Go to projects list' : 'Close'}
              type={Type.primary}
              size="lg"
              onClick={service === SupportedCloud.WORDPRESS ? goToProjectsList : onClick}
              marginClassName="mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
