import 'animate.css'
import { store } from 'app/libs/redux/state.store'
import { Startupper } from 'app/libs/startupper/startupper.class'
import { AdminLayout } from 'app/components/admin-layout/admin-layout.component'
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import { Provider as StoreProvider } from 'react-redux'
import './index.css'
import { ModalProvider } from 'app/components/shared-components/modals/modal.component'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

new Startupper().init()

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <ModalProvider>
        <Router>
          <AdminLayout />
        </Router>
      </ModalProvider>
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorkerRegistration.register()
