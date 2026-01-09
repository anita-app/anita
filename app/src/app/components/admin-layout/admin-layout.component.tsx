import React, { useEffect } from 'react'
import { AnitaRoutes } from 'app/libs/routing/anita-routes.component'
import { AdminLayoutContent } from 'app/components/admin-layout/admin-layout-content.component'
import { AdminLayoutHeader } from 'app/components/admin-layout/header/header.component'
import { AdminLayoutSidebar } from 'app/components/admin-layout/admin-layout-sidebar.component'
import { OAuthUtils } from 'app/libs/cloud-sync/o-auth-utils.class'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'

export const AdminLayout: React.FC = () => {
  const project = useAtomValue(ProjectAtoms.current)
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
