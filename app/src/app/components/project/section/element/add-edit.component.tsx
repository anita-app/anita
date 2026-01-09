import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Manager } from 'app/cross-refs-exports'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectSectionElementAddEditFormManager } from 'app/components/project/section/element/add-edit-form-manager.component'
import { ProjectSectionElementAddEditSaveCancelButtons } from 'app/components/project/section/element/add-edit-save-cancel-buttons.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { FormElementState } from 'app/state/form-element/form-element-state.class'

export const ProjectSectionElementAddEdit: React.FC = () => {
  const params = useParams()
  const mode = params[URL_PARAMS.elementId] ? EDITOR_MODE.edit : EDITOR_MODE.add

  const projectId = params[URL_PARAMS.projectId]
  const sectionId = params[URL_PARAMS.sectionId]
  const elementId = (mode === EDITOR_MODE.edit) ? params[URL_PARAMS.elementId] : null

  const [element, setElement] = useState<Partial<ISectionElement> | null | undefined>(null)

  useEffect(() => {
    const fetchElement = async () => {
      const project = await Manager.getProjectById(projectId)

      if (!sectionId || !project || !project.getSectionById(sectionId)) {
        return setElement(undefined)
      }

      if (mode === EDITOR_MODE.add) {
        return setElement({})
      }

      const element = await project.getSectionById(sectionId)?.getElementById(elementId!)
      setElement(element as ISectionElement | undefined)
    }

    fetchElement()
  }, [mode, projectId, sectionId, elementId])

  useEffect(() => {
    if (element === null) {
      FormElementState.setElement(null)
      return
    }

    if (element !== undefined) {
      FormElementState.setElement(element as ISectionElement)
    }
  }, [element])

  if (element === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  const headerText = mode === EDITOR_MODE.add ? 'Add Element' : 'Edit Element'

  return (
    <MainContentContainer headerText={headerText} overflowClassName="overflow-y-visible">
      {element === null && <Loader />}
      {element !== null && <ProjectSectionElementAddEditFormManager sectionId={sectionId!} />}
      {element !== null && <ProjectSectionElementAddEditSaveCancelButtons sectionId={sectionId!} />}
    </MainContentContainer>
  )
}
