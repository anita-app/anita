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
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { getRecordTitle } from 'app/models/section/title-field.function'
import type { FC } from 'react'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

/**
 * @feature record.add
 * @title Add a record
 * @summary Creates a new record in a section by filling in a form with the fields of the section.
 * @where List of a section: the round "+" button at the bottom right (its label "New record" appears on hover), or "Create a new entry" when the section is empty. Details page of a record with child sections: "Add to" followed by the name of the child section.
 * @usage Click "+" (or press C), fill in the fields, then click "Save" or "Save & Close".
 * @options In a section that is a child of other sections, a "Linked to" selector at the top of the form links the new record to records of the parent sections. When the form is opened from the tab of a child section on a details page, the new record is already linked to that record.
 * @rules The form header reads "Add to" followed by the section name. Required fields are marked with an asterisk. The C shortcut works on the list of a section.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectSectionAddEle
 * @shortcuts C
 * @related record.save, record.edit, view.child-records-tabs
 */
export const ProjectSectionElementAddEdit: FC = () => {
  const params = useParams()
  const mode = params[URL_PARAMS.elementId] ? EDITOR_MODE.edit : EDITOR_MODE.add

  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const elementIdFromParams = useAtomValue(RoutingAtoms.param(URL_PARAMS.elementId))
  const elementId = (mode === EDITOR_MODE.edit) ? elementIdFromParams : null
  const section = useAtomValue(ProjectAtoms.currentProject)?.getSectionById(sectionId!)

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

  /**
   * @feature record.edit
   * @title Edit a record
   * @summary Changes the values of an existing record in the same form used to add it.
   * @where Details page of a record: the round pencil button at the bottom right (its label "Edit record" appears on hover).
   * @usage Open a record, click the pencil button (or press E), change the fields, then click "Save" or "Save & Close".
   * @options The "Linked to" selector, in sections that are children of other sections, changes the records this one is linked to.
   * @rules The form header reads "Edit" followed by the name of the record as it was saved ("Edit record" when it has no name). The form shows a loader until the record is read. The E shortcut works on the details page of a record.
   * @errors none
   * @status stable
   * @since 0.1.0
   * @routes projectSectionEditEle
   * @shortcuts E
   * @related record.save, record.details, record.title
   */
  const isReady = element !== null && loadedFor === formKey
  // Named after the saved record (not the one being typed), as on the details page.
  const recordTitle = mode === EDITOR_MODE.edit && section?.formModel ? getRecordTitle(section.formModel, elementFromDB as ISectionElement | null) : undefined
  const headerText = mode === EDITOR_MODE.add
    ? (section ? `Add to ${section.title}` : 'Add record')
    : (recordTitle ? `Edit “${recordTitle.title}”` : 'Edit record')

  return (
    <MainContentContainer
      headerText={headerText}
      eyebrow={section?.title}
      wrapHeader={!!recordTitle}
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
