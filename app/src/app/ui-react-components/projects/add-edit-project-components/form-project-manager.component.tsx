import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant'
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function'
import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { IProjectSettings, RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { ProjectSaver } from 'app/libs/project-helpers/project-handlers/project-saver.class'
import { ProjectsListLoader } from 'app/libs/projects-helpers/projects-handlers/projects-list-loader.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum'
import { SectionManager } from 'app/ui-react-components/projects/add-edit-project-components/section-manager.component'
import { SUCCESS_BTN_OUTLINE } from 'app/ui-react-components/shared-components/buttons/buttons-layout-tw-classes.const'
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'

export const FormProjectManager: React.FC = () => {

  const { projectId } = useParams<URL_PARAMS>();
  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode);
  const project = useSelector((state: AnitaStore) => state.formProject.project);
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState);
  const mode: EDITOR_MODE = projectId ? EDITOR_MODE.edit : EDITOR_MODE.add;
  const navigate = useNavigate();

  const handleProjectChange = (fieldName: keyof IProjectSettings, value: IProjectSettings[keyof IProjectSettings]) => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectSettings, payload: { fieldName, value } });
  }

  const handleClickSave = async () => {
    await new ProjectSaver(project as SystemData, mode).save();
    await new ProjectsListLoader().load();
    Manager.setCurrentProject(project as SystemData);
    navigate(urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: project[RESERVED_AUDS_KEYS._settings][0].id }]));
  }

  const handleClickAddSection = () => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectAddSection });
  }

  const projectFormModel = mode === EDITOR_MODE.add ?
    PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].projectInfo.newItem :
    PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].projectInfo.existingItem;

  return (
    <span>
      <div className="mt-5 p-4 bg-white rounded shadow">
        <FormAutomator formModel={projectFormModel as any} element={project[RESERVED_AUDS_KEYS._settings][0]} handleChange={handleProjectChange} />
      </div>
      <div className="px-1 md:px-2 lg:px-3">
        {project[RESERVED_AUDS_KEYS._sections].map((section, index) => <SectionManager key={section.id} section={section} sectionIndex={index} />)}
      </div>
      <div className="mt-5 p-4 bg-white rounded shadow">
        <div className="flex items-end flex-wrap">
          <button
            className={`w-full sm:w-auto py-2 px-6 sm:mr-3 ${SUCCESS_BTN_OUTLINE}`}
            onClick={handleClickAddSection}
          >Add section</button>
          <button
            className="w-5/12 sm:w-auto sm:ml-auto py-2 px-6 bg-gray-200 font-semibold rounded hover:bg-gray-300 mr-3"
            onClick={() => navigate(-1)}
          >Cancel</button>
          <button
            disabled={Object.keys(validObj).some(key => validObj[key] === false)}
            className="w-5/12 ml-auto sm:ml-0 mt-8 sm:mt-0 sm:w-auto py-2 px-6 bg-prussian-blue-400 text-white font-semibold rounded hover:bg-prussian-blue-500 disabled:bg-gray-400 disabled:bg-opacity-40 disabled:cursor-not-allowed"
            onClick={handleClickSave}
          >Save</button>
        </div>
      </div>
    </span>
  )
}