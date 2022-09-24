import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Manager } from 'app/libs/manager/manager.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectSectionElementDeleteButton } from 'app/components/project/section/element/delete-button.component'
import { ProjectSectionElementDetailsParentsLinks } from 'app/components/project/section/element/details-parents-links.component'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { AddEditElementButton } from 'app/components/shared-components/buttons/add-edit-element-button.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { CheckBoxEditable } from 'app/components/shared-components/values-renderers/checkbox-editable.component'

const ValueWithLabel = ({ formModel, value }: { formModel: FormFieldsModel<ISectionElement>; value: any }) => {
  if (typeof value === 'undefined') {
    return null
  }

  return (
    <div>
      <p className="text-sm text-gray-500">{formModel.label}</p>
      <div className="mb-3">{customRenderPicker(formModel)({ value })}</div>
    </div>
  )
}

const ElementValuesViewer = ({ element, formModels, sectionId }: { element: ISectionElement; formModels: Array<FormFieldsModel<ISectionElement>>; sectionId: string }) => (
  <div className="p-3">
    {formModels.map((formModel) => {
      if (!formModel.label) {
        return null
      }
      if (formModel.componentCode === FORM_COMPONENTS_CODES.basicCheckbox) {
        return (
          <CheckBoxEditable
            key={formModel.fieldName}
            elementId={element.id as string}
            sectionId={sectionId}
            label={formModel.label}
            fieldName={formModel.fieldName}
            value={element[formModel.fieldName]}
          />)
      }

      return <ValueWithLabel key={formModel.fieldName} formModel={formModel} value={element[formModel.fieldName]} />
    }
    )}
  </div>
)

export const ProjectSectionElementDetails: React.FC = () => {
  const [element, setElement] = useState<ISectionElement | undefined | null>(null)
  const params = useParams()
  const projectId = params[URL_PARAMS.projectId]
  const sectionId = params[URL_PARAMS.sectionId]
  const elementId = params[URL_PARAMS.elementId]

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      const project = await Manager.getProjectById(projectId)

      if (!sectionId || !elementId || !project || !project.getSectionById(sectionId)) {
        return setElement(undefined)
      }

      const element = await project.getSectionById(sectionId)?.getElementById(elementId)

      if (isMounted) {
        setElement(element as ISectionElement | undefined)
      }
    }

    if (isMounted) {
      fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [projectId, sectionId, elementId])

  if (element === undefined) {
    if (projectId && sectionId) {
      return <Navigate to={urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])} />
    }
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  return (
    <MainContentContainer headerText="Details">
      {(element === null) ? <Loader /> : <ElementValuesViewer element={element} formModels={Manager.getCurrentProject()?.getSectionById(sectionId)!.formModel!} sectionId={sectionId!} />}
      {(element !== null && element.parentsInfo && Array.isArray(element.parentsInfo) && element.parentsInfo.length > 0) && <ProjectSectionElementDetailsParentsLinks projectId={projectId!} parentsInfo={element.parentsInfo} sections={Manager.getCurrentProject()?.getSectionsDefinitions()!} />}
      {(element !== null && (
        <div>
          <ProjectSectionElementDeleteButton projectId={projectId!} sectionId={sectionId!} elementId={elementId!} />
          <AddEditElementButton projectId={projectId!} sectionId={sectionId!} elementId={elementId!} mode={EDITOR_MODE.edit} />
        </div>
      )
      )}
    </MainContentContainer>
  )
}
