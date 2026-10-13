import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectSectionElementAddEditFormManager } from 'app/components/project/section/element/add-edit-form-manager.component'
import { ProjectSectionElementAddEditSaveCancelButtons } from 'app/components/project/section/element/add-edit-save-cancel-buttons.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
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

  // ?parent=<sectionId>|<elementId>: the new record is already linked to that parent record.
  const [searchParams] = useSearchParams()
  const parent = searchParams.get('parent')
  // null while loading: the form must not be built before the record is there.
  const elementFromDB = useLiveQuery(() => Queriers.getElement(projectId!, sectionId!, elementId!), [projectId, sectionId, elementId], null)
  const element = useMemo(() => {
    if (mode === EDITOR_MODE.edit) {
      // Right after moving to another record the query may still return the previous one.
      return elementFromDB && elementFromDB.id !== elementId ? null : elementFromDB
    }
    return parent ? { parentsInfo: [parent] } : {}
  }, [mode, elementFromDB, elementId, parent])

  // Some fields (e.g. rich text) read their value only when they are built: the form is shown only once the
  // shared form state holds the record of this page, never the one of the previous form.
  const formKey = `${sectionId}|${elementId ?? ''}|${parent ?? ''}`
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    if (element === null) {
      FormElementState.setElement(null)
      setLoadedFor(null)
      return
    }

    if (element !== undefined) {
      FormElementState.setElement(element as ISectionElement)
      setLoadedFor(formKey)
    }
  }, [element, formKey])

  useEffect(() => () => FormElementState.setElement(null), [])

  if (element === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  const isReady = element !== null && loadedFor === formKey
  const headerText = mode === EDITOR_MODE.add ? 'Add Element' : 'Edit Element'

  return (
    <MainContentContainer
      headerText={headerText}
      overflowClassName="overflow-y-visible"
    >
      {!isReady && <Loader />}
      {isReady && (
        <ProjectSectionElementAddEditFormManager
          key={formKey}
          sectionId={sectionId!}
        />
      )}
      {isReady && <ProjectSectionElementAddEditSaveCancelButtons sectionId={sectionId!} />}
    </MainContentContainer>
  )
}
