import { useEffect } from 'react'
import { AdminLayoutContent } from 'app/components/admin-layout/admin-layout-content.component'
import { AdminLayoutHeader } from 'app/components/admin-layout/header/header.component'
import { AdminLayoutSidebar } from 'app/components/admin-layout/admin-layout-sidebar.component'
import { OAuthUtils } from 'app/libs/cloud-sync/o-auth-utils.class'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Outlet, useLocation } from 'react-router-dom'
import { LocalOnlyBanner } from 'app/components/project/local-only-banner.component'
import { StoreOnWordPressDialog } from 'app/components/remotes/store-on-wordpress-dialog.component'
import { WordPressSyncAgent } from 'app/components/admin-layout/wordpress-sync-agent.component'
import type { FC } from 'react'

export const AdminLayout: FC = () => {
  const project = useAtomValue(ProjectAtoms.currentSystemData)
  const location = useLocation()
  useEffect(() => {
    OAuthUtils.redirectToAuthPageIfUrlHasCode()
  }, [])

  return (
    <>
      <WordPressSyncAgent />
      <StoreOnWordPressDialog />
      <AdminLayoutHeader />
      <div className="relative admin-container flex">
        {!!project && <AdminLayoutSidebar />}
        <AdminLayoutContent>
          {location.pathname.startsWith('/project/') && <LocalOnlyBanner />}
          <Outlet />
        </AdminLayoutContent>
      </div>
    </>
  )
}
