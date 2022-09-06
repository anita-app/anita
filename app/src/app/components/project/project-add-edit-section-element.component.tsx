import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Manager } from 'app/libs/manager/manager.class'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectFormElementManager } from 'app/components/project/project-add-edit/project-form-element-manager.component'
import { ProjectSaveElement } from 'app/components/project/project-add-edit/project-save-element.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

export const AddEditSectionElement: React.FC = () => {
  const params = useParams()
  const mode = params[URL_PARAMS.elementId] ? EDITOR_MODE.edit : EDITOR_MODE.add

  const projectId = params[URL_PARAMS.projectId]
  const sectionId = params[URL_PARAMS.sectionId]
  const elementId = (mode === EDITOR_MODE.edit) ? params[URL_PARAMS.elementId] : null

  const [element, setElement] = useState<Partial<ISectionElement> | null | undefined>(null)

  useEffect(() => {
    let isMounted = true

    const fetchElement = async () => {
      const project = await Manager.getProjectById(projectId)

      if (!sectionId || !project || !project.getSectionById(sectionId)) {
        return setElement(undefined)
      }

      if (mode === EDITOR_MODE.add) {
        return setElement({})
      }

      const element = await project.getSectionById(sectionId)?.getElementById(elementId!)
      if (isMounted) {
        setElement(element as ISectionElement | undefined)
      }
    }

    if (isMounted) {
      fetchElement()
    }

    return () => {
      isMounted = false
    }
  }, [mode, projectId, sectionId, elementId])

  if (element === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  const headerText = mode === EDITOR_MODE.add ? 'Add Element' : 'Edit Element'

  storeDispatcher({ type: REDUX_ACTIONS.updateFormElement, payload: element! })

  return (
    <MainContentContainer headerText={headerText} overflowClassName="overflow-y-visible">
      {element === null && <Loader />}
      {element !== null && <ProjectFormElementManager sectionId={sectionId!} />}
      {element !== null && <ProjectSaveElement sectionId={sectionId!} />}
    </MainContentContainer>
  )
}
