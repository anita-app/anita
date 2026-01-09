import 'animate.css'
import { Startupper } from 'app/libs/startupper/startupper.class'
import { AdminLayout } from 'app/components/admin-layout/admin-layout.component'
import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import './index.css'
import { ModalPortal } from 'app/components/shared-components/modals/modal.component'
import * as ReactDOMClient from 'react-dom/client'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import 'tippy.js/dist/tippy.css'

const start = async () => {
  await new Startupper().init()
  const rootElement = document.getElementById('root')
  const root = ReactDOMClient.createRoot(rootElement!)
  root.render(
    <React.StrictMode>
      <ModalPortal />
      <Router>
        <AdminLayout />
      </Router>
    </React.StrictMode>
  )
}

start()
serviceWorkerRegistration.register()
