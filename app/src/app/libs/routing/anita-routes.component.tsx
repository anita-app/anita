/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */
import { useEffect, useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ProjectSectionElementAddEdit } from 'app/components/project/section/element/add-edit.component'
import { ProjectDetails } from 'app/components/project/details.component'
import { ProjectSectionElementDetailsPage } from 'app/components/project/section/element/details.component'
import { ProjectSectionList } from 'app/components/project/section/list/list.component'
import { AddEditProject } from 'app/components/projects/add-edit-project.component'
import { ProjectsNone } from 'app/components/projects/no-projects.component'
import { ProjectsList } from 'app/components/projects/projects-list.component'
import { createHashRouter, Navigate, Outlet } from 'react-router-dom'
import { OAuth } from 'app/components/auth/o-auth.component'
import { Remotes } from 'app/components/remotes/remotes.component'
import { NewProject } from 'app/components/templates/new-project.component'
import { CreateFromTemplate } from 'app/components/templates/create-from-template.component'
import { AdminLayout } from 'app/components/admin-layout/admin-layout.component'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { Manager } from 'app/cross-refs-exports'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { useAtomValue } from 'jotai'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import type { FC } from 'react'
import type { RouteObject } from 'react-router-dom'

const ProjectLoadedGuard: FC = () => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))
  const [hasProject, setHasProject] = useState<boolean | null>(null)
  const [loadedProjectId, setLoadedProjectId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        return
      }

      const project = await Manager.getProjectById(projectId)
      setHasProject(Boolean(project))
      setLoadedProjectId(projectId)
    }

    loadProject()
  }, [projectId])

  if (hasProject === null || loadedProjectId !== projectId) {
    return <Loader />
  }

  if (hasProject === false) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  return <Outlet />
}

const anitaRoutes: Array<RouteObject> = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to={ANITA_URLS.projectsList} replace={true} /> },
      { path: `${ANITA_URLS.auth}/*`, element: <OAuth /> },
      { path: ANITA_URLS.remotes, element: <Remotes /> },
      // Address of the page when it listed only WordPress sites.
      { path: '/wordpress-sites', element: <Navigate to={ANITA_URLS.remotes} replace={true} /> },
      { path: ANITA_URLS.projectsList, element: <ProjectsList /> },
      { path: ANITA_URLS.projectAdd, element: <AddEditProject /> },
      { path: ANITA_URLS.projectNew, element: <NewProject /> },
      { path: ANITA_URLS.projectNewFromTemplate, element: <CreateFromTemplate /> },
      { path: ANITA_URLS.projectsNone, element: <ProjectsNone /> },
      {
        element: <ProjectLoadedGuard />,
        children: [
          { path: ANITA_URLS.projectEdit, element: <AddEditProject /> },
          { path: ANITA_URLS.projectDetails, element: <ProjectDetails /> },
          { path: ANITA_URLS.projectSectionElesList, element: <ProjectSectionList /> },
          { path: ANITA_URLS.projectSectionEleDetails, element: <ProjectSectionElementDetailsPage /> },
          { path: ANITA_URLS.projectSectionAddEle, element: <ProjectSectionElementAddEdit /> },
          { path: ANITA_URLS.projectSectionEditEle, element: <ProjectSectionElementAddEdit /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to={ANITA_URLS.projectsList} replace={true} />,
      },
    ],
  },
]

/**
 * @feature navigation.addresses
 * @title Page addresses and the Back button
 * @summary Every page of Anita has its own address, so you can bookmark it, reload it and go back with the browser's Back button.
 * @where The address bar of the browser (addresses look like .../#/project/.../list/...); the Back and Forward buttons of the browser or of the phone.
 * @usage Use the Back and Forward buttons, bookmark a page, or reload it: Anita opens the same page.
 * @options none
 * @rules The part of the address after # says which page is open: the projects list, a project, a section list, a record, a form.
 * The address of the app itself (/) and unknown addresses open the projects list.
 * A page of a project shows a loader while the project opens; if the project does not exist on this device (for example a link from another device or a deleted project), Anita opens the projects list.
 * An address points to data on this device only: sending it to someone else does not share the record.
 * Pages change with a short animation; the header and the sidebar stay in place.
 * @errors none
 * @status stable
 * @since 0.2.4
 * @routes projectsList
 * @related navigation.sidebar
 */
export const anitaRouter = createHashRouter(anitaRoutes)
RoutingState.navigate = anitaRouter.navigate

let lastSyncedLocationKey: string | null = null

const syncRouteStateWithRouterLocation = (location: typeof anitaRouter.state.location) => {
  if (!location) {
    return
  }
  const locationKey = `${location.pathname}${location.search}`
  if (locationKey === lastSyncedLocationKey) {
    return
  }
  lastSyncedLocationKey = locationKey
  RoutingState.syncFromPath(locationKey)
}

syncRouteStateWithRouterLocation(anitaRouter.state.location)
anitaRouter.subscribe(({ location }) => {
  syncRouteStateWithRouterLocation(location)
})
