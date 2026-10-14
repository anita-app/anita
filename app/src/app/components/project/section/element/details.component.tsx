import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectSectionElementDeleteButton } from 'app/components/project/section/element/delete-button.component'
import { ProjectSectionElementDetailsParentsLinks } from 'app/components/project/section/element/details-parents-links.component'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { AddEditElementButton } from 'app/components/shared-components/buttons/add-edit-element-button.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Navigate } from 'react-router-dom'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { CheckBoxEditable } from 'app/components/shared-components/values-renderers/checkbox-editable.component'
import { useShortcut } from 'app/components/hooks/shortcut'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { useAtomValue } from 'jotai'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import { useLiveQuery } from 'dexie-react-hooks'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { ChildRecordsTabs } from 'app/components/project/section/element/child-records-tabs.component'
import { useState } from 'react'
import { getRecordTitle } from 'app/models/section/title-field.function'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { FC } from 'react'

const ValueWithLabel: FC<{ formModel: FormFieldsModel<ISectionElement>; value: any }> = (props) => {
  if (typeof props.value === 'undefined') {
    return null
  }

  // Long texts take the whole row.
  const isLong = [FORM_COMPONENTS_CODES.richText, FORM_COMPONENTS_CODES.basicTextarea].includes(Number(props.formModel.componentCode))

  return (
    <div className={`ui-field ${isLong ? 'sm:col-span-2' : ''}`}>
      <p className="ui-field-label">{props.formModel.label}</p>
      <div className="ui-field-value">{customRenderPicker(props.formModel)({ value: props.value }) as React.ReactNode}</div>
    </div>
  )
}

const ElementValuesViewer: FC<{ element: ISectionElement; formModels: Array<FormFieldsModel<ISectionElement>>; sectionId: string; titleFieldName?: string }> = (props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
    {props.formModels.map((formModel) => {
      // The title of the record is already the header of the page.
      if (!formModel.label || formModel.fieldName === props.titleFieldName) {
        return null
      }
      if (formModel.componentCode === FORM_COMPONENTS_CODES.basicCheckbox) {
        return (
          <div
            key={formModel.fieldName}
            className="ui-field"
          >
            <CheckBoxEditable
              element={props.element}
              sectionId={props.sectionId}
              label={formModel.label}
              fieldName={formModel.fieldName}
            />
          </div>)
      }

      return (
        <ValueWithLabel
          key={formModel.fieldName}
          formModel={formModel}
          value={props.element[formModel.fieldName]}
        />
      )
    },
    )}
  </div>
)

const goBack = () => {
  RoutingState.goTo(-1)
}

const collapsedKey = (sectionId: string) => `anita.detailsCollapsed.${sectionId}`

/**
 * Whether the details of the records of a section are collapsed, remembered on this device.
 */
const useDetailsCollapsed = (sectionId: string | undefined): [boolean, () => void] => {
  const [collapsedBySection, setCollapsedBySection] = useState<Record<string, boolean>>({})
  if (!sectionId) {
    return [false, () => undefined]
  }
  let collapsed = collapsedBySection[sectionId]
  if (collapsed === undefined) {
    try {
      collapsed = localStorage.getItem(collapsedKey(sectionId)) === '1'
    } catch {
      collapsed = false
    }
  }
  const toggle = () => {
    try {
      localStorage.setItem(collapsedKey(sectionId), collapsed ? '0' : '1')
    } catch {
      // Storage disabled: the choice lasts until the page is reloaded.
    }
    setCollapsedBySection({ ...collapsedBySection, [sectionId]: !collapsed })
  }
  return [collapsed, toggle]
}

export const ProjectSectionElementDetails: FC<{ collapsible: boolean }> = (props) => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const elementId = useAtomValue(RoutingAtoms.param(URL_PARAMS.elementId))
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, sectionId!), [projectId, sectionId])
  const element = useLiveQuery(() => Queriers.getElement(projectId, sectionId!, elementId!), [projectId, sectionId, elementId], null)
  const [collapsed, toggleCollapsed] = useDetailsCollapsed(sectionId)

  useShortcut({ key: 'Escape', callback: goBack })

  if (!sectionData) {
    return null
  }

  if (element === undefined) {
    if (projectId && sectionId) {
      return <Navigate to={urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])} />
    }
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  // The record is named by its title field (e.g. the name of a client); "Details" when it has none.
  const recordTitle = getRecordTitle(sectionData.formModel!, element)
  const headerText = element === null ? '\u00a0' : (recordTitle?.title ?? 'Details')

  return (
    <>
      <MainContentContainer
        headerText={headerText}
        eyebrow={sectionData.title}
        wrapHeader={!!recordTitle}
        collapsible={props.collapsible ? { collapsed, onToggle: toggleCollapsed } : undefined}
      >
        {(element === null)
          ? <Loader />
          : <ElementValuesViewer
              element={element}
              formModels={sectionData.formModel!}
              sectionId={sectionId!}
              titleFieldName={recordTitle?.fieldName}
            />}
        {(element !== null && element.parentsInfo && Array.isArray(element.parentsInfo) && element.parentsInfo.length > 0) && (
        <ProjectSectionElementDetailsParentsLinks
          projectId={projectId!}
          parentsInfo={element.parentsInfo}
        />
        )}
        {(element !== null && (
        <div className="flex flex-wrap gap-y-2 mt-5 pt-4 border-t border-[#eef1f5]">
          <ProjectSectionElementDeleteButton
            projectId={projectId!}
            sectionId={sectionId!}
            elementId={elementId!}
          />
        </div>
        )
      )}
      </MainContentContainer>
      {/* Outside the panel, so that it stays available when the details are collapsed. */}
      {element !== null && (
      <AddEditElementButton
        projectId={projectId!}
        sectionId={sectionId!}
        elementId={elementId!}
        mode={EDITOR_MODE.edit}
      />
      )}
    </>
  )
}

export const ProjectSectionElementDetailsPage: FC = () => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const elementId = useAtomValue(RoutingAtoms.param(URL_PARAMS.elementId))
  const project = useAtomValue(ProjectAtoms.currentProject)
  const hasChildSections = !!sectionId && !!project?.getSectionsDefinitions().some(section => section.childOf?.includes(sectionId))
  return (
    <>
      <ProjectSectionElementDetails collapsible={hasChildSections} />
      {projectId && sectionId && elementId && (
        <ChildRecordsTabs
          key={elementId}
          projectId={projectId}
          sectionId={sectionId}
          elementId={elementId}
        />
      )}
    </>
  )
}
