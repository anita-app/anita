import { ANITA_URLS } from 'app/anita-routes/anita-routes.constant';
import { projectInfoNewItem } from 'app/data/project-form-builder/project-info-builder.constant';
import { AnitaUniversalDataStorage, ProjectSettings, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info';
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { CurrentProjectSetter } from 'app/libs/project-helpers/project-handlers/current-project-setter.class';
import { ProjectFileDataImporter } from 'app/libs/projects-helpers/file-handle-helpers/project-file-data-importer.class';
import { ProjectFileImporter } from 'app/libs/projects-helpers/file-handle-helpers/project-file-importer.class';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component';
import { FormAutomatorOnChangeValue, FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

// Disabled rule as <a> and <button> would have different layouts
/* eslint-disable jsx-a11y/anchor-is-valid */

export const ProjectImportButton = ({ btnType = 'icon' }: { btnType?: 'icon' | 'text' }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate__fadeIn');
  const [projectData, setProjectData] = useState<AnitaUniversalDataStorage>(null);
  const [projectFileHandle, setProjectFileHandle] = useState<FileSystemFileHandle>();

  const handleClickModal = async () => {
    if (isModalOpen) {
      setAnimationClass('animate__fadeOut')
      setTimeout(() => setIsModalOpen(false), 500);
    } else {
      const { project, fileHandle } = await new ProjectFileDataImporter().import()
      setAnimationClass('animate__fadeIn')
      setIsModalOpen(true)
      setProjectData(project);
      setProjectFileHandle(fileHandle);
    }
  }

  return (
    <span>
      {btnType === 'icon' ? (<span><button data-tip data-for="importProject"
        onClick={handleClickModal}
        className="mx-2 my-2 text-white bg-prussian-blue-600 border-0 py-1 px-6 focus:outline-none hover:bg-prussian-blue-700 rounded font-bold text-sm"
      ><i className="bi bi-arrow-bar-down"></i>
      </button>
        <ReactTooltip id="importProject" effect="solid">
          <span>Import an existing project</span>
        </ReactTooltip></span>
      ) : (
        <button data-tip data-for="importProject"
          onClick={handleClickModal}
          className="w-full mt-4 text-white bg-prussian-blue-400 border-0 py-3 px-8 focus:outline-none hover:bg-prussian-blue-500 rounded font-bold text-sm"
        >
          Import an existing project
        </button>
      )}
      {isModalOpen && <ImportProjectModal projectData={projectData} fileHandle={projectFileHandle} closeFn={handleClickModal} animationClass={animationClass} />}
    </span>
  )
}

export const ImportProjectModal = ({ projectData, fileHandle, closeFn, animationClass }: { projectData?: AnitaUniversalDataStorage, fileHandle: FileSystemFileHandle, closeFn: () => void, animationClass: string }) => {

  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(projectData?.[RESERVED_AUDS_KEYS._settings][0]);
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState);

  const navigate = useNavigate();

  useEffect(() => {
    if (projectData) {
      setProjectSettings(projectData?.[RESERVED_AUDS_KEYS._settings][0]);
    }
  }, [projectData]);



  const handleClickImport = async () => {
    projectData[RESERVED_AUDS_KEYS._settings][0] = projectSettings;
    await new ProjectFileImporter(projectData, fileHandle).import();
    closeFn();
    new CurrentProjectSetter(projectData[RESERVED_AUDS_KEYS._settings], projectData[RESERVED_AUDS_KEYS._sections]).set();
    setTimeout(() => navigate(ANITA_URLS.projectsList), 500);
  }

  const handleProjectChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    setProjectSettings({ ...projectSettings, [fieldName]: value });
  }

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className={`animate__animated ${animationClass} animate__faster fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity`} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`animate__animated ${animationClass} animate__faster inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Import Project
                </h3>
                <div className="mt-2">
                  {projectSettings && <FormAutomator element={projectSettings} formModel={projectInfoNewItem as Array<FormFieldsModel<any>>} handleChange={handleProjectChange} />}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              disabled={Object.keys(validObj).some(key => validObj[key] === false)}
              onClick={handleClickImport}
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-prussian-blue-500 text-base font-medium text-white hover:bg-prussian-blue-600 focus:outline-none focus:ring-0 focus:bg-prussian-blue-800 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Import
            </button>
            <button onClick={closeFn} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:bg-gray-200 focus:outline-none focus:ring-0 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}