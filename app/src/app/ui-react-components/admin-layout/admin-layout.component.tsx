import { AnitaRoutes } from 'app/anita-routes/anita-routes.component';
import { SidebarMenu } from 'app/ui-react-components/admin-layout/components/sidebar-menu.component';
import { Content } from 'app/ui-react-components/admin-layout/content.component';
import { Header } from 'app/ui-react-components/admin-layout/header.component';
import { Sidebar } from 'app/ui-react-components/admin-layout/sidebar.component';
import { HashRouter as Router } from 'react-router-dom';

export const AdminLayout = () => (
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
);