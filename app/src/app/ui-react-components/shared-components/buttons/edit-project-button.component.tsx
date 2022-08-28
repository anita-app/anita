import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { IProjectSettings } from 'app/data/project-structure/project-info';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

interface IEditButtonProps {
  project: IProjectSettings
}

export const EditButton: React.FC<IEditButtonProps> = ({ project }) => (
  <Link
    to={urlParamFiller(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: project.id }])}
    className="px-4 py-3 text-gray-800 mr-3 inline-flex items-center ml-auto leading-none text-sm bg-gray-100 hover:bg-gray-200 rounded"
    data-tip data-for="editProject"
  >
    <i className="bi-pencil"></i> <span className="ml-2 hidden sm:inline-block">Edit Project</span>
    <ReactTooltip id="editProject" effect="solid">
      Edit project
    </ReactTooltip>
  </Link>
)