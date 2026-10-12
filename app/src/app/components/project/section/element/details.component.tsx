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
import { Section } from 'app/models/section/section.class'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { ISection } from 'app/models/section/section.declarations'
import type { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { FC } from 'react'

const ValueWithLabel: FC<{ formModel: FormFieldsModel<ISectionElement>; value: any }> = (props) => {
  if (typeof props.value === 'undefined') {
    return null
  }

  return (
    <div>
      <p className="text-sm text-gray-500">{props.formModel.label}</p>
      <div className="mb-3">{customRenderPicker(props.formModel)({ value: props.value }) as React.ReactNode}</div>
    </div>
  )
}

const ElementValuesViewer: FC<{ element: ISectionElement; formModels: Array<FormFieldsModel<ISectionElement>>; sectionId: string }> = (props) => (
  <div className="p-3">
    {props.formModels.map((formModel) => {
      if (!formModel.label) {
        return null
      }
      if (formModel.componentCode === FORM_COMPONENTS_CODES.basicCheckbox) {
        return (
          <CheckBoxEditable
            key={formModel.fieldName}
            element={props.element}
            sectionId={props.sectionId}
            label={formModel.label}
            fieldName={formModel.fieldName}
          />)
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

/**
 * Title of a record, shown next to the header when the details are collapsed.
 */
const recordTitle = (sectionData: ISection, projectId: string, element: ISectionElement | null): string | undefined => {
  const field = new Section(projectId, sectionData).getFirstUserDefinedField()
  const value = field && element ? element[field.fieldName] : undefined
  return typeof value === 'string' && !value.startsWith('[') ? value : (typeof value === 'number' ? String(value) : undefined)
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

  return (
    <>
      <MainContentContainer
        headerText="Details"
        collapsible={props.collapsible ? { collapsed, onToggle: toggleCollapsed, summary: recordTitle(sectionData, projectId, element) } : undefined}
      >
        {(element === null)
          ? <Loader />
          : <ElementValuesViewer
              element={element}
              formModels={sectionData.formModel!}
              sectionId={sectionId!}
            />}
        {(element !== null && element.parentsInfo && Array.isArray(element.parentsInfo) && element.parentsInfo.length > 0) && (
        <ProjectSectionElementDetailsParentsLinks
          projectId={projectId!}
          parentsInfo={element.parentsInfo}
        />
        )}
        {(element !== null && (
        <div className="flex flex-wrap gap-y-2 px-3">
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
