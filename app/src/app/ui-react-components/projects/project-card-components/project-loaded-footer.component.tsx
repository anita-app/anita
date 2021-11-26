import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { ProjectSettings } from 'app/data/project-structure/project-info';
import { EditButton } from 'app/ui-react-components/shared-components/buttons/edit-project-button.component';
import { Link } from 'react-router-dom';

export const ProjectLoadedFooter = ({ project }: { project: ProjectSettings }) => (
  <div className="ml-auto">
    <EditButton project={project} />
    <Link to={urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: project.id }])} className="px-4 py-3 text-white inline-flex items-center leading-none text-sm bg-prussian-blue-400 hover:bg-prussian-blue-500 rounded">
      <i className="bi-info-circle mr-2"></i>Project details
    </Link>
  </div>

)