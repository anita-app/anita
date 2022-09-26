import React from 'react'
import { AnitaRoutes } from 'app/libs/routing/anita-routes.component'
import { AdminLayoutContent } from 'app/components/admin-layout/admin-layout-content.component'
import { AdminLayoutHeader } from 'app/components/admin-layout/admin-layout-header.component'
import { AdminLayoutSidebar } from 'app/components/admin-layout/admin-layout-sidebar.component'
import { HashRouter as Router } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AnitaStore } from 'app/libs/redux/reducers.const'

export const AdminLayout: React.FC = () => {
  const project = useSelector((state: AnitaStore) => state.project)
  return (
    <Router>
      <AdminLayoutHeader />
      <div className="relative admin-container flex">
        {!!project && <AdminLayoutSidebar />}
        <AdminLayoutContent>
          <AnitaRoutes />
        </AdminLayoutContent>
      </div>
    </Router>
  )
}
