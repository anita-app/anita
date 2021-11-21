import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { dbInstances } from 'app/data/db-instances.const';
import { RESERVED_UDS_KEYS, SectionElement } from 'app/data/model/project-info';
import { isProjectLoaded } from 'app/libs/project-helpers/project-handlers/is-project-loaded.function';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { findSectionById } from 'app/libs/tools/find-section-by-id.function';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { ParentsLinkShower } from 'app/ui-react-components/project/details-components/parents-link-shower.component';
import { customRenderPicker } from 'app/ui-react-components/project/values-renderers/custom-render-picker.component';
import { AddEditElementButton } from 'app/ui-react-components/shared-components/buttons/add-edit-element-button.component';
import { MainContentContainer } from 'app/ui-react-components/shared-components/common-ui-eles/main-content-container.component';
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { Loader } from 'app/ui-react-components/shared-components/loader/loader.component';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';

export const SectionElementDetails = () => {

  const [element, setElement] = useState<SectionElement>(null);
  const project = useSelector((state: AnitaStore) => state.project);
  const params = useParams();
  const projectId = params[URL_PARAMS.projectId];
  const sectionId = params[URL_PARAMS.sectionId];
  const elementId = params[URL_PARAMS.elementId];

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!isProjectLoaded(projectId) || !projectId || !sectionId || !elementId || !project || project[RESERVED_UDS_KEYS._settings][0].id !== projectId)
        return setElement(undefined);

      const element = await dbInstances[projectId].callSelector<SectionElement>(sectionId, { id: elementId }).single();

      if (isMounted)
        setElement(element);
    }

    if (isMounted)
      fetchData();

    return () => { isMounted = false };
  }, [projectId, sectionId, elementId, project]);

  if (element === undefined) {
    if (projectId && sectionId)
      return <Navigate to={urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])} />
    else
      return <Navigate to={ANITA_URLS.projectsList} />
  }

  return (
    <MainContentContainer headerText="Details">
      {(element === null) ? <Loader /> : <ElementValuesViewer element={element} formModels={findSectionById(project[RESERVED_UDS_KEYS._sections], sectionId).formModel as Array<FormFieldsModel<SectionElement>>} />}
      {(element !== null && element.parentsInfo && Array.isArray(element.parentsInfo) && element.parentsInfo.length > 0) && <ParentsLinkShower projectId={projectId} parentsInfo={element.parentsInfo} sections={project[RESERVED_UDS_KEYS._sections]} />}
      {(element !== null && <AddEditElementButton projectId={projectId} sectionId={sectionId} elementId={elementId} mode={EDITOR_MODE.edit} />)}
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
