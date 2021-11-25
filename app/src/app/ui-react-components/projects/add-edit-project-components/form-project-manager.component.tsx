import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { PROJECT_EDITOR_FORM_MODELS_CONST } from 'app/data/form-models/project-editor-form-models.const';
import { RESERVED_UDS_KEYS, SystemData } from 'app/data/model/project-info';
import { CurrentProjectSetter } from 'app/libs/project-helpers/project-handlers/current-project-setter.class';
import { ProjectSaver } from 'app/libs/project-helpers/project-handlers/project-saver.class';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { SectionManager } from 'app/ui-react-components/projects/add-edit-project-components/section-manager.component';
import { SUCCESS_BTN_OUTLINE } from 'app/ui-react-components/shared-components/buttons/buttons-layout-tw-classes.const';
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component';
import { FormAutomatorOnChangeValue } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

export const FormProjectManager = () => {

  const { projectId } = useParams<URL_PARAMS>();
  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode);
  const project = useSelector((state: AnitaStore) => state.formProject.project);
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState);
  const navigate = useNavigate();

  const handleProjectChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    store.dispatch({ type: REDUX_ACTIONS.updateFormProjectSettings, payload: { ...project[RESERVED_UDS_KEYS._settings][0], [fieldName]: value } });
  }

  const handleClickSave = () => {
    const mode: EDITOR_MODE = projectId ? EDITOR_MODE.edit : EDITOR_MODE.add;
    new ProjectSaver(project as SystemData, mode).save();
    new CurrentProjectSetter(project[RESERVED_UDS_KEYS._settings], project[RESERVED_UDS_KEYS._sections]).set();
    navigate(urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: project[RESERVED_UDS_KEYS._settings][0].id }]));
  }

  const handleClickAddSection = () => {
    store.dispatch({ type: REDUX_ACTIONS.updateFormProjectAddSection });
  }

  return (
    <span>
      <div className="mt-5 p-4 bg-white rounded shadow">
        <FormAutomator formModel={PROJECT_EDITOR_FORM_MODELS_CONST[projectEditorMode].projectInfo as any} element={project[RESERVED_UDS_KEYS._settings][0]} handleChange={handleProjectChange} />
      </div>
      <div className="px-1 md:px-2 lg:px-3">
        {project[RESERVED_UDS_KEYS._sections].map((section, index) => <SectionManager key={section.id} section={section} sectionIndex={index} />)}
      </div>
      <div className="mt-5 p-4 bg-white rounded shadow">
        <div className="flex items-end flex-wrap">
          <button
            className={`py-2 px-6 mr-3 ${SUCCESS_BTN_OUTLINE}`}
            onClick={handleClickAddSection}
          >Add section</button>
          <button
            className="ml-auto py-2 px-6 bg-gray-200 font-semibold rounded hover:bg-gray-300 mr-3"
            onClick={() => navigate(-1)}
          >Cancel</button>
          <button
            disabled={Object.keys(validObj).some(key => validObj[key] === false)}
            className="py-2 px-6 bg-prussian-blue-400 text-white font-semibold rounded hover:bg-prussian-blue-500 disabled:bg-gray-400 disabled:bg-opacity-40 disabled:cursor-not-allowed"
            onClick={handleClickSave}
          >Save</button>
        </div>
      </div>
    </span>
  )
}