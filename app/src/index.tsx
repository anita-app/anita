import 'animate.css'
import { store } from 'app/libs/redux/state.store'
import { Startupper } from 'app/libs/startupper/startupper.class'
import { AdminLayout } from 'app/components/admin-layout/admin-layout.component'
import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { Provider as StoreProvider } from 'react-redux'
import './index.css'
import { ModalProvider } from 'app/components/shared-components/modals/modal.component'
import * as ReactDOMClient from 'react-dom/client'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import 'tippy.js/dist/tippy.css'

new Startupper().init()
const rootElement = document.getElementById('root')
const root = ReactDOMClient.createRoot(rootElement!)
root.render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <ModalProvider>
        <Router>
          <AdminLayout />
        </Router>
      </ModalProvider>
    </StoreProvider>
  </React.StrictMode>
)

serviceWorkerRegistration.register()
