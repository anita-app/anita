import { StrictMode } from 'react'
import 'animate.css'
import { Startupper } from 'app/libs/startupper/startupper.class'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { ModalPortal } from 'app/components/shared-components/modals/modal.component'
import { anitaRouter } from 'app/libs/routing/anita-routes.component'
import * as ReactDOMClient from 'react-dom/client'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import 'tippy.js/dist/tippy.css'

const start = async () => {
  await new Startupper().init()
  const rootElement = document.getElementById('root')
  const root = ReactDOMClient.createRoot(rootElement!)
  root.render(
    <StrictMode>
      <ModalPortal />
      <RouterProvider router={anitaRouter} />
    </StrictMode>,
  )
}

start()
serviceWorkerRegistration.register()
