import React from 'react'
import { AnitaRoutes } from 'app/libs/routing-n/anita-routes.component'
import { SidebarMenu } from 'app/components/admin-layout/components/sidebar-menu.component'
import { Content } from 'app/components/admin-layout/content.component'
import { Header } from 'app/components/admin-layout/header.component'
import { Sidebar } from 'app/components/admin-layout/sidebar.component'
import { HashRouter as Router } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AnitaStore } from 'app/libs/redux/reducers.const'

export const AdminLayout: React.FC = () => {
  const project = useSelector((state: AnitaStore) => state.project)
  return (
    <Router>
      <Header />
      <div className="relative admin-container flex">
        {!!project && (
        <Sidebar>
          <SidebarMenu />
        </Sidebar>
        )}
        <Content>
          <AnitaRoutes />
        </Content>
      </div>
    </Router>
  )
}
