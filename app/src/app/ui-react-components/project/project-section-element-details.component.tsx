import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { SectionElement } from 'app/data/project-structure/project-info';
import { Manager } from 'app/libs/Manager/Manager.class';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { ProjectDeleteSectionElementButton } from 'app/ui-react-components/project/project-details/project-delete-section-element-button.component';
import { ProjectParentsLinkShower } from 'app/ui-react-components/project/project-details/project-parents-link-shower.component';
import { customRenderPicker } from 'app/ui-react-components/project/project-values-renderers/custom-render-picker.component';
import { AddEditElementButton } from 'app/ui-react-components/shared-components/buttons/add-edit-element-button.component';
import { MainContentContainer } from 'app/ui-react-components/shared-components/common-ui-eles/main-content-container.component';
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { Loader } from 'app/ui-react-components/shared-components/loader/loader.component';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

export const SectionElementDetails: React.FC = () => {

  const [element, setElement] = useState<SectionElement>(null);
  const params = useParams();
  const projectId = params[URL_PARAMS.projectId];
  const sectionId = params[URL_PARAMS.sectionId];
  const elementId = params[URL_PARAMS.elementId];

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const project = await Manager.getProjectById(projectId);

      if (!sectionId || !elementId || !project)
        return setElement(undefined);

      const element = await project.getSectionById(sectionId).getElementById(elementId);

      if (isMounted)
        setElement(element);
    }

    if (isMounted)
      fetchData();

    return () => { isMounted = false };
  }, [projectId, sectionId, elementId]);

  if (element === undefined) {
    if (projectId && sectionId)
      return <Navigate to={urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])} />
    else
      return <Navigate to={ANITA_URLS.projectsList} />
  }

  return (
    <MainContentContainer headerText="Details">
      {(element === null) ? <Loader /> : <ElementValuesViewer element={element} formModels={Manager.getCurrentProject().getSectionById(sectionId).formModel} />}
      {(element !== null && element.parentsInfo && Array.isArray(element.parentsInfo) && element.parentsInfo.length > 0) && <ProjectParentsLinkShower projectId={projectId} parentsInfo={element.parentsInfo} sections={Manager.getCurrentProject().getSectionsDefinitions()} />}
      {(element !== null && (<div>
        <ProjectDeleteSectionElementButton projectId={projectId} sectionId={sectionId} elementId={elementId} />
        <AddEditElementButton projectId={projectId} sectionId={sectionId} elementId={elementId} mode={EDITOR_MODE.edit} />
      </div>
      )
      )}
    </MainContentContainer>
  )

}

const ElementValuesViewer = ({ element, formModels }: { element: SectionElement, formModels: Array<FormFieldsModel<SectionElement>> }) => {

  return (
    <div className="p-3">
      {formModels.map((formModel) => {
        if (!formModel.label)
          return null;

        return <ValueWithLabel key={formModel.fieldName} formModel={formModel} value={element[formModel.fieldName]} />
      }
      )}
    </div>
  )
}

const ValueWithLabel = ({ formModel, value }: { formModel: FormFieldsModel<SectionElement>, value: any }) => {
  if (typeof value === 'undefined')
    return null;

  return (
    <div>
      <p className="text-sm text-gray-500">{formModel.label}</p>
      <p className="mb-3">{customRenderPicker(formModel)({ value })}</p>
    </div>
  )
}
