import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectSectionElementAddEditFormManager } from 'app/components/project/section/element/add-edit-form-manager.component'
import { ProjectSectionElementAddEditSaveCancelButtons } from 'app/components/project/section/element/add-edit-save-cancel-buttons.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { useEffect, useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { FormElementState } from 'app/state/form-element/form-element-state.class'
import { useLiveQuery } from 'dexie-react-hooks'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { useAtomValue } from 'jotai'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import type { FC } from 'react'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

export const ProjectSectionElementAddEdit: FC = () => {
  const params = useParams()
  const mode = params[URL_PARAMS.elementId] ? EDITOR_MODE.edit : EDITOR_MODE.add

  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const elementIdFromParams = useAtomValue(RoutingAtoms.param(URL_PARAMS.elementId))
  const elementId = (mode === EDITOR_MODE.edit) ? elementIdFromParams : null

  const elementFromDB = useLiveQuery(() => Queriers.getElement(projectId!, sectionId!, elementId!), [projectId, sectionId, elementId], {})
  const element = useMemo(() => (mode === EDITOR_MODE.edit) ? elementFromDB : {}, [mode, elementFromDB])

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
    <MainContentContainer
      headerText={headerText}
      overflowClassName="overflow-y-visible"
    >
      {element === null && <Loader />}
      {element !== null && <ProjectSectionElementAddEditFormManager sectionId={sectionId!} />}
      {element !== null && <ProjectSectionElementAddEditSaveCancelButtons sectionId={sectionId!} />}
    </MainContentContainer>
  )
}
