import { ANITA_URLS } from 'app/anita-routes/anita-routes.constant';
import { projectInfoNewItem } from 'app/data/project-form-builder/project-info-builder.constant';
import { AnitaUniversalDataStorage, IProjectSettings, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info';
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { Manager } from 'app/libs/Manager/Manager.class';
import { ProjectDataImporter } from 'app/libs/projects-helpers/project-importers/project-data-importer.class';
import { ProjectFileImporter } from 'app/libs/projects-helpers/project-importers/project-file-importer.class';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component';
import { FormAutomatorOnChangeValue, FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { Modal } from 'app/ui-react-components/shared-components/modals/modal.component';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

interface IImportProjectButtonProps {
  btnType?: 'icon' | 'text'
}

export const ImportProjectButton: React.FC<IImportProjectButtonProps> = ({ btnType = 'icon' }) => {

  const navigate = useNavigate();
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate__fadeIn');
  const [projectData, setProjectData] = useState<AnitaUniversalDataStorage>(null);
  const [projectFileHandle, setProjectFileHandle] = useState<FileSystemFileHandle>();
  const [projectSettings, setProjectSettings] = useState<IProjectSettings>(null);

  const handleClickModal = async () => {
    if (isModalOpen) {
      setAnimationClass('animate__fadeOut')
      setTimeout(() => setIsModalOpen(false), 500);
    } else {
      const { project, fileHandle } = await new ProjectFileImporter().import() || {};

      if (!project)
        return;

      setAnimationClass('animate__fadeIn')
      setIsModalOpen(true)
      setProjectData(project);
      setProjectSettings(project[RESERVED_AUDS_KEYS._settings][0])
      setProjectFileHandle(fileHandle);
    }
  }

  const handleClickImport = async () => {
    projectData[RESERVED_AUDS_KEYS._settings][0] = projectSettings;
    await new ProjectDataImporter(projectData, projectFileHandle).import();
    handleClickModal();
    Manager.setCurrentProject(projectData);
    setTimeout(() => navigate(ANITA_URLS.projectsList), 500);
  }

  const handleProjectChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    setProjectSettings({ ...projectSettings, [fieldName]: value });
  }

  return (
    <span>
      {btnType === 'icon' ? (<span><button data-tip data-for="importProject"
        onClick={handleClickModal}
        className="mx-2 my-2 text-white bg-prussian-blue-600 border-0 py-1 px-6 focus:outline-none hover:bg-prussian-blue-700 rounded font-bold text-sm"
      ><i className="bi bi-arrow-bar-down"></i>
      </button>
        <ReactTooltip id="importProject" effect="solid">
          Import an existing project
        </ReactTooltip></span>
      ) : (
        <button data-tip data-for="importProject"
          onClick={handleClickModal}
          className="w-full mt-4 text-white bg-prussian-blue-400 border-0 py-3 px-8 focus:outline-none hover:bg-prussian-blue-500 rounded font-bold text-sm"
        >
          Import an existing project
        </button>
      )}
      {isModalOpen && <Modal
        title="Import project"
        actionText="Import"
        type="confirm"
        handleClickAction={handleClickImport}
        closeFn={handleClickModal}
        animationClass={animationClass}
        disableAction={Object.keys(validObj).some(key => validObj[key] === false)}
      >
        {projectSettings && <FormAutomator element={projectSettings} formModel={projectInfoNewItem as Array<FormFieldsModel<any>>} handleChange={handleProjectChange} />}
      </Modal>
      }
    </span>
  )
}
