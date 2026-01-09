import React from 'react'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ProjectSectionElementAddEdit } from 'app/components/project/section/element/add-edit.component'
import { ProjectDetails } from 'app/components/project/details.component'
import { ProjectSectionElementDetails } from 'app/components/project/section/element/details.component'
import { ProjectSectionList } from 'app/components/project/section/list/list.component'
import { AddEditProject } from 'app/components/projects/add-edit-project.component'
import { ProjectsNone } from 'app/components/projects/no-projects.component'
import { ProjectsList } from 'app/components/projects/projects-list.component'
import { createHashRouter, Navigate, RouteObject } from 'react-router-dom'
import { OAuth } from 'app/components/auth/o-auth.component'
import { AdminLayout } from 'app/components/admin-layout/admin-layout.component'
import { RoutingState } from 'app/state/routing/routing-state.class'

const anitaRoutes: Array<RouteObject> = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { path: `${ANITA_URLS.auth}/*`, element: <OAuth /> },
      { path: ANITA_URLS.projectsList, element: <ProjectsList /> },
      { path: ANITA_URLS.projectAdd, element: <AddEditProject /> },
      { path: ANITA_URLS.projectEdit, element: <AddEditProject /> },
      { path: ANITA_URLS.projectsNone, element: <ProjectsNone /> },
      { path: ANITA_URLS.projectDetails, element: <ProjectDetails /> },
      { path: ANITA_URLS.projectSectionElesList, element: <ProjectSectionList /> },
      { path: ANITA_URLS.projectSectionEleDetails, element: <ProjectSectionElementDetails /> },
      { path: ANITA_URLS.projectSectionAddEle, element: <ProjectSectionElementAddEdit /> },
      { path: ANITA_URLS.projectSectionEditEle, element: <ProjectSectionElementAddEdit /> },
      { path: '*', element: <Navigate to={ANITA_URLS.projectsList} replace={true} /> }
    ]
  }
]

export const anitaRouter = createHashRouter(anitaRoutes)

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
