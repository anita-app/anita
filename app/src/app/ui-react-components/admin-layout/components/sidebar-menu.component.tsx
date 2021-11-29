import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

const baseStyleOfSidebarLinks: string = "block py-2.5 px-4 transition duration-200 border-l-2 hover:border-prussian-blue-700 hover:text-prussian-blue-500 text-sm font-semibold";

const addActiveClassNameToBaseStyle = (currentPath: string, linkPath: string): string => {
  if (currentPath === linkPath) {
    return `${baseStyleOfSidebarLinks} border-prussian-blue-700`;
  } else {
    return `${baseStyleOfSidebarLinks} border-transparent`;
  }
}

export const nonProjectRoutes: Array<{ to: string; txt: string, icon: string }> = [
  { to: ANITA_URLS.projectsList, txt: 'Projects', icon: 'bi-files' }
];

const ProjectMenu = () => {

  const project = useSelector((state: AnitaStore) => state.project);
  const location = useLocation();


  if (project === null)
    return <span></span>

  return (
    <div className="mt-3">
      <div className="block py-2.5 px-4">
        <p className="text-xs text-gray-600">Current project:</p>
        <p>{project?.[RESERVED_AUDS_KEYS._settings][0]?.title}</p>
      </div>
      <div className="block py-2.5 px-4">
        <p className="text-xs text-gray-600">Project sections:</p>
      </div>
      {project?.[RESERVED_AUDS_KEYS._sections]?.map(section => {
        const linkPath = urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: project[RESERVED_AUDS_KEYS._settings][0].id }, { name: URL_PARAMS.sectionId, value: section.id }]);
        return (<Link
          key={section.id}
          to={linkPath}
          className={addActiveClassNameToBaseStyle(location.pathname, linkPath)}
        ><i className="bi-chevron-compact-right"></i><span className="ml-2">{section.title}</span>
        </Link>)
      }
      )}
    </div>
  )

}

export const SidebarMenu = () => {
  const location = useLocation();

  return (
    <div>{
      nonProjectRoutes.map(route => (<Link
        key={route.to}
        to={route.to}
        className={addActiveClassNameToBaseStyle(location.pathname, route.to)}
      ><i className={route.icon}></i><span className="ml-2">{route.txt}</span>
      </Link>)
      )
    }
      < ProjectMenu />
    </div>
  );
}