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

// React Router runs page changes in a view transition; when the page updates during the animation (for example
// because a sync finished), the browser aborts the transition and the router leaves the rejection unhandled.
// The navigation itself completes, so the error is harmless.
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.name === 'InvalidStateError' && /transition was aborted/i.test(event.reason?.message ?? '')) {
    event.preventDefault()
  }
})

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
