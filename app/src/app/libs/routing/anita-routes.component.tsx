import React from 'react'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ProjectSectionElementAddEdit } from 'app/components/project/section/element/add-edit.component'
import { ProjectDetails } from 'app/components/project/details.component'
import { ProjectSectionElementDetails } from 'app/components/project/section/element/details.component'
import { ProjectSectionList } from 'app/components/project/section/list/list.component'
import { AddEditProject } from 'app/components/projects/add-edit-project.component'
import { ProjectsNone } from 'app/components/projects/no-projects.component'
import { ProjectsList } from 'app/components/projects/projects-list.component'
import { Navigate, Route, Routes } from 'react-router-dom'

export const AnitaRoutes = () => (
  <Routes>
    <Route path={ANITA_URLS.projectsList} element={<ProjectsList />} />
    <Route path={ANITA_URLS.projectAdd} element={<AddEditProject />} />
    <Route path={ANITA_URLS.projectEdit} element={<AddEditProject />} />
    <Route path={ANITA_URLS.projectsNone} element={<ProjectsNone />} />
    <Route path={ANITA_URLS.projectDetails} element={<ProjectDetails />} />

    <Route path={ANITA_URLS.projectSectionElesList} element={<ProjectSectionList />} />
    <Route path={ANITA_URLS.projectSectionEleDetails} element={<ProjectSectionElementDetails />} />
    <Route path={ANITA_URLS.projectSectionAddEle} element={<ProjectSectionElementAddEdit />} />
    <Route path={ANITA_URLS.projectSectionEditEle} element={<ProjectSectionElementAddEdit />} />
    <Route
      path="*" element={<Navigate to={ANITA_URLS.projectsList} />}
    />
  </Routes>
)
