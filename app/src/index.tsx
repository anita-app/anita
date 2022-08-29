import 'animate.css'
import { store } from 'app/libs/redux/state.store'
import { Startupper } from 'app/libs/startupper/startupper.class'
import { AdminLayout } from 'app/Components/admin-layout/admin-layout.component'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

new Startupper().init()

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AdminLayout />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorkerRegistration.register()
