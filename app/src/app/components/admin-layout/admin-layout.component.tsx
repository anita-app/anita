import React, { useEffect } from 'react'
import { AnitaRoutes } from 'app/libs/routing/anita-routes.component'
import { AdminLayoutContent } from 'app/components/admin-layout/admin-layout-content.component'
import { AdminLayoutHeader } from 'app/components/admin-layout/header/header.component'
import { AdminLayoutSidebar } from 'app/components/admin-layout/admin-layout-sidebar.component'
import { useSelector } from 'react-redux'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { OAuthUtils } from 'app/libs/cloud-sync/o-auth-utils.class'

export const AdminLayout: React.FC = () => {
  const project = useSelector((state: AnitaStore) => state.project)
  useEffect(() => {
    OAuthUtils.redirectToAuthPageIfUrlHasCode()
  }, [])

  return (
    <>
      <AdminLayoutHeader />
      <div className="relative admin-container flex">
        {!!project && <AdminLayoutSidebar />}
        <AdminLayoutContent>
          <AnitaRoutes />
        </AdminLayoutContent>
      </div>
    </>
  )
}
