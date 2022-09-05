import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { SectionElement } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/manager/manager.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectDeleteSectionElementButton } from 'app/components/project/project-details/project-delete-section-element-button.component'
import { ProjectParentsLinkShower } from 'app/components/project/project-details/project-parents-link-shower.component'
import { customRenderPicker } from 'app/components/project/project-values-renderers/custom-render-picker.component'
import { AddEditElementButton } from 'app/components/shared-components/buttons/add-edit-element-button.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

const ValueWithLabel = ({ formModel, value }: { formModel: FormFieldsModel<SectionElement>, value: any }) => {
  if (typeof value === 'undefined') {
    return null
  }

  return (
    <div>
      <p className="text-sm text-gray-500">{formModel.label}</p>
      <p className="mb-3">{customRenderPicker(formModel)({ value })}</p>
    </div>
  )
}

const ElementValuesViewer = ({ element, formModels }: { element: SectionElement, formModels: Array<FormFieldsModel<SectionElement>> }) => (
    <div className="p-3">
      {formModels.map((formModel) => {
        if (!formModel.label) {
          return null
        }

        return <ValueWithLabel key={formModel.fieldName} formModel={formModel} value={element[formModel.fieldName]} />
      }
      )}
    </div>
)

export const SectionElementDetails: React.FC = () => {
  const [element, setElement] = useState<SectionElement | undefined | null>(null)
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
        setElement(element as SectionElement | undefined)
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
      {(element === null) ? <Loader /> : <ElementValuesViewer element={element} formModels={Manager.getCurrentProject()?.getSectionById(sectionId)!.formModel!} />}
      {(element !== null && element.parentsInfo && Array.isArray(element.parentsInfo) && element.parentsInfo.length > 0) && <ProjectParentsLinkShower projectId={projectId!} parentsInfo={element.parentsInfo} sections={Manager.getCurrentProject()?.getSectionsDefinitions()!} />}
      {(element !== null && (
        <div>
          <ProjectDeleteSectionElementButton projectId={projectId!} sectionId={sectionId!} elementId={elementId!} />
          <AddEditElementButton projectId={projectId!} sectionId={sectionId!} elementId={elementId!} mode={EDITOR_MODE.edit} />
        </div>
      )
      )}
    </MainContentContainer>
  )
}
