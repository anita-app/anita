import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { ProjectSettings } from 'app/data/model/project-info';
import { Link } from 'react-router-dom';

export const EditButton = ({ project }: { project: ProjectSettings }) => (
  <Link to={urlParamFiller(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: project.id }])} className="px-4 py-3 text-gray-800 mr-3 inline-flex items-center ml-auto leading-none text-sm bg-gray-100 hover:bg-gray-200 rounded">
    <i className="bi-pencil"></i> <span className="ml-2 hidden sm:inline-block">Edit Project</span>
  </Link>
)