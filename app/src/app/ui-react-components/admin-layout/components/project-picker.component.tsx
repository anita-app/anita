import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant'
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function'
import { RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { useClickOutside } from 'app/ui-react-components/hooks/click-outside.hook'
import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

interface IProjectPickerProps {
  project: SystemData
}

export const ProjectPicker: React.FC<IProjectPickerProps> = ({ project }) => {

  const projects = useSelector((store: AnitaStore) => store.projects);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropDownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropDownRef, () => setDropdownOpen(false));

  const handleClick = (fn) => {
    setDropdownOpen(!dropdownOpen);
  }

  const loadProject = async (projectId: string) => {
    await Manager.loadProjectById(projectId)
    goToDetails(projectId);
  }

  const goToDetails = (projectId: string) => {
    navigate(urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: projectId }]));
  }

  const goToEditProject = (projectId: string) => {
    navigate(urlParamFiller(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: projectId }]));
  }

  return (
    <div ref={dropDownRef}>
      <p className="text-xs text-gray-600 pl-2">Current project:</p>

      <div x-data="{ dropdownOpen: true }" className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative w-full flex justify-between text-left z-10 rounded py-2 px-3 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-300">
          <span>{project?.[RESERVED_AUDS_KEYS._settings][0]?.title}</span>
          <i className="bi-chevron-expand my-auto"></i>
        </button>


        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-md overflow-hidden shadow-xl z-20 border border-bg-500">
            {projects?.length > 1 && (<div className="block py-2.5 px-4 text-sm bg-gray-100 text-gray-600">Projects on this device</div>)}
            {projects?.map(projectFromList => {
              if (project[RESERVED_AUDS_KEYS._settings][0].id === projectFromList.id) return null;
              return (
                <button key={projectFromList.id} className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(loadProject(projectFromList.id))}>{projectFromList.title}</button>)
            })}
            <div className="block py-2.5 px-4 text-sm bg-gray-100 text-gray-600">Actions</div>
            <button className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(goToDetails(project[RESERVED_AUDS_KEYS._settings][0].id))}>
              <i className="bi-info-circle mr-2"></i>
              Go to the details of the project
            </button>
            <button className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(goToEditProject(project[RESERVED_AUDS_KEYS._settings][0].id))}>
              <i className="bi-pencil mr-2"></i>
              Edit the current project
            </button>
            <button className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(navigate(ANITA_URLS.projectsList))}>
              <i className="bi-files mr-2"></i>
              Go to the projects list
            </button>
            <button className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(navigate(ANITA_URLS.projectAdd))}>
              <i className="bi-plus mr-2"></i>
              Create a new project
            </button>
          </div>
        )}
      </div >
    </div >
  );

}
