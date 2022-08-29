import React from 'react'
import { AnitaRoutes } from 'app/libs/Routing/anita-routes.component'
import { SidebarMenu } from 'app/Components/admin-layout/components/sidebar-menu.component'
import { Content } from 'app/Components/admin-layout/content.component'
import { Header } from 'app/Components/admin-layout/header.component'
import { Sidebar } from 'app/Components/admin-layout/sidebar.component'
import { HashRouter as Router } from 'react-router-dom'

export const AdminLayout: React.FC = () => (
  <Router>
    <Header />
    <div className="relative admin-container flex">
      <Sidebar>
        <SidebarMenu />
      </Sidebar>
      <Content>
        <AnitaRoutes />
      </Content>
    </div>
  </Router>
)
