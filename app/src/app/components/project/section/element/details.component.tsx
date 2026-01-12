import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Manager } from 'app/cross-refs-exports'
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
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { useLiveQuery } from 'dexie-react-hooks'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
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

export const ProjectSectionElementDetails: FC = () => {
  const projectId = useAtomValue(ProjectAtoms.projectId)!
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const elementId = useAtomValue(RoutingAtoms.param(URL_PARAMS.elementId))
  const section = useAtomValue(ProjectAtoms.sectionById(sectionId))
  const element = useLiveQuery(() => section?.getElementById(elementId!) || null, [section], null)

  const goBack = () => {
    RoutingState.goTo(-1)
  }

  useShortcut({ key: 'Escape', callback: goBack })

  if (element === undefined) {
    if (projectId && sectionId) {
      return <Navigate to={urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])} />
    }
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  return (
    <MainContentContainer headerText="Details">
      {(element === null)
        ? <Loader />
        : <ElementValuesViewer
            element={element}
            formModels={Manager.getCurrentProject()?.getSectionById(sectionId)!.formModel!}
            sectionId={sectionId!}
          />}
      {(element !== null && element.parentsInfo && Array.isArray(element.parentsInfo) && element.parentsInfo.length > 0) && (
        <ProjectSectionElementDetailsParentsLinks
          projectId={projectId!}
          parentsInfo={element.parentsInfo}
          sections={Manager.getCurrentProject()?.getSectionsDefinitions()!}
        />
      )}
      {(element !== null && (
        <div>
          <ProjectSectionElementDeleteButton
            projectId={projectId!}
            sectionId={sectionId!}
            elementId={elementId!}
          />
          <AddEditElementButton
            projectId={projectId!}
            sectionId={sectionId!}
            elementId={elementId!}
            mode={EDITOR_MODE.edit}
          />
        </div>
      )
      )}
    </MainContentContainer>
  )
}
