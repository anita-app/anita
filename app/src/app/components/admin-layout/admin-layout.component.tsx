import { useEffect } from 'react'
import { AdminLayoutContent } from 'app/components/admin-layout/admin-layout-content.component'
import { AdminLayoutHeader } from 'app/components/admin-layout/header/header.component'
import { AdminLayoutSidebar } from 'app/components/admin-layout/admin-layout-sidebar.component'
import { OAuthUtils } from 'app/libs/cloud-sync/o-auth-utils.class'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Outlet, useLocation } from 'react-router-dom'
import { LocalOnlyBanner } from 'app/components/project/local-only-banner.component'
import { LocalFileAccessBanner } from 'app/components/project/local-file-sync-status.component'
import { StoreProjectDialog } from 'app/components/remotes/store-project-dialog.component'
import { CloudSyncAgent } from 'app/components/admin-layout/cloud-sync-agent.component'
import { ProjectLoader } from 'app/models/project/project-loader.class'
import { ProjectState } from 'app/state/project/project-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { Bucket } from 'app/state/bucket.state'
import type { FC } from 'react'

/**
 * @featurePart navigation.sidebar, navigation.reopen-last-project
 */
export const AdminLayout: FC = () => {
  const project = useAtomValue(ProjectAtoms.currentSystemData)
  const location = useLocation()
  useEffect(() => {
    OAuthUtils.redirectToAuthPageIfUrlHasCode()
  }, [])

  /**
   * @feature navigation.reopen-last-project
   * @title Reopen the last project
   * @summary When you come back to Anita, the project you used last is opened again in the sidebar.
   * @where Automatic, when Anita starts on a page that is not inside a project (for example the projects list).
   * @usage Nothing to do: open or reload Anita and the sidebar shows the last project you opened.
   * @options none
   * @rules Anita remembers on this device the last project you opened; if that project no longer exists, the first project of the list is opened; with no projects nothing is opened.
   * Pages inside a project (their address starts with /project/) open the project of their address instead.
   * The remembered project is per browser: other browsers or devices remember their own.
   * @errors none
   * @status stable
   * @since 1.0.0
   * @related navigation.project-picker
   */
  // The sidebar (sections and project picker) needs a project. Project pages load theirs; on the other pages, after
  // a reload, the project opened last is reopened, or the first one.
  useEffect(() => {
    if (Bucket.general.get(ProjectAtoms.currentSystemData) || location.pathname.startsWith('/project/')) {
      return
    }
    const projects = Bucket.general.get(ProjectsListAtoms.projects) ?? []
    const lastProjectId = ProjectState.getLastProjectId()
    const projectId = projects.find(project => project.id === lastProjectId)?.id ?? projects[0]?.id
    if (projectId) {
      new ProjectLoader(projectId).loadProject().catch(() => undefined)
    }
  // Only when the app starts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <CloudSyncAgent />
      <StoreProjectDialog />
      <AdminLayoutHeader />
      <div className="relative admin-container ui-aurora flex">
        {!!project && <AdminLayoutSidebar />}
        <AdminLayoutContent>
          {location.pathname.startsWith('/project/') && <LocalOnlyBanner />}
          {location.pathname.startsWith('/project/') && <LocalFileAccessBanner />}
          <Outlet />
        </AdminLayoutContent>
      </div>
    </>
  )
}
