import { EDITOR_MODE } from 'app/components/editor-mode.enum'

export enum URL_PARAMS {
  projectId = 'projectId',
  sectionId = 'sectionId',
  elementId = 'elementId',
  parentId = 'parentId'
}

/**
 * Lists all the routes in the application
 *
 * @remarks We can't use the enum approach here because we need to concat strings.
 */
export const ANITA_URLS = {
  // PROJECTS
  projectsNone: '/projects/none',
  projectsList: '/projects/list',
  projectAdd: `/projects/${EDITOR_MODE.add}`,
  projectEdit: `/projects/${EDITOR_MODE.edit}/:${URL_PARAMS.projectId}`,
  // PROJECT
  projectDetails: `/project/:${URL_PARAMS.projectId}/info`,
  projectSectionElesList: `/project/:${URL_PARAMS.projectId}/list/:${URL_PARAMS.sectionId}`,
  projectSectionAddEle: `/project/:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/${EDITOR_MODE.add}`,
  projectSectionEditEle: `/project/:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/${EDITOR_MODE.edit}/:${URL_PARAMS.elementId}`,
  projectSectionEleDetails: `/project/:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/details/:${URL_PARAMS.elementId}`
}
