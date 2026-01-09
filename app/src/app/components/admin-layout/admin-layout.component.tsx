import React, { useEffect } from 'react'
import { AdminLayoutContent } from 'app/components/admin-layout/admin-layout-content.component'
import { AdminLayoutHeader } from 'app/components/admin-layout/header/header.component'
import { AdminLayoutSidebar } from 'app/components/admin-layout/admin-layout-sidebar.component'
import { OAuthUtils } from 'app/libs/cloud-sync/o-auth-utils.class'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Outlet } from 'react-router-dom'

export const AdminLayout: React.FC = () => {
  const project = useAtomValue(ProjectAtoms.currentSystemData)
  useEffect(() => {
    OAuthUtils.redirectToAuthPageIfUrlHasCode()
  }, [])

  return (
    <>
      <AdminLayoutHeader />
      <div className="relative admin-container flex">
        {!!project && <AdminLayoutSidebar />}
        <AdminLayoutContent>
          <Outlet />
        </AdminLayoutContent>
      </div>
    </>
  )
}
