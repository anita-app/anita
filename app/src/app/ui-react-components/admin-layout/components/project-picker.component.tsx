import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info';
import { ProjectLoader } from 'app/libs/project-helpers/project-handlers/project-loader.class';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const ProjectPicker = ({ project }: { project: SystemData }) => {

  const projects = useSelector((store: AnitaStore) => store.projects);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleClick = (fn) => {
    setDropdownOpen(!dropdownOpen);
  }

  const loadProject = async (projectId: string) => {
    await new ProjectLoader(projectId).loadProject()
    goToDetails(projectId);
  }

  const goToDetails = (projectId: string) => {
    navigate(urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: projectId }]));
  }

  return (
    <span>
      {dropdownOpen && (<div onClick={() => setDropdownOpen(false)} className="absolute inset-0 h-full w-full z-10"></div>)}
      <p className="text-xs text-gray-600 pl-3">Current project:</p>

      <div x-data="{ dropdownOpen: true }" className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative w-full flex justify-between text-left z-10 rounded py-2 px-3 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-300">
          <span>{project?.[RESERVED_AUDS_KEYS._settings][0]?.title}</span>
          <i className="bi-chevron-expand my-auto"></i>
        </button>


        {dropdownOpen && (<div className="absolute left-0 mt-2 w-60 bg-white rounded-md overflow-hidden shadow-xl z-20 border border-bg-500">
          {projects?.length > 1 && (<div className="block py-2.5 px-4 text-sm bg-gray-100 text-gray-600">Projects on this device</div>)}
          {projects?.map(projectFromList => {
            if (project[RESERVED_AUDS_KEYS._settings][0].id === projectFromList.id) return null;
            return (
              <button key={projectFromList.id} className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(loadProject(projectFromList.id))}>{projectFromList.title}</button>)
          })}
          <div className="block py-2.5 px-4 text-sm bg-gray-100 text-gray-600">Actions</div>
          <button className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(goToDetails(project[RESERVED_AUDS_KEYS._settings][0].id))}>Go to the details of this project</button>
          <button className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(navigate(ANITA_URLS.projectsList))}>Go to the projects list</button>
          <button className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => handleClick(navigate(ANITA_URLS.projectAdd))}>Create a new project</button>
        </div>)}
      </div >
    </span >
  );

}