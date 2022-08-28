import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { IProjectSettings, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { ProjectLoadedFooter } from 'app/ui-react-components/projects/project-card-components/project-loaded-footer.component';
import { ProjectNotLoadedFooter } from 'app/ui-react-components/projects/project-card-components/project-not-loaded-footer.component';
import { DeleteProjectButton } from 'app/ui-react-components/shared-components/buttons/delete-project.component';
import { CardFooterItemsEnd } from 'app/ui-react-components/shared-components/common-ui-eles/card-footer-items-end.component';
import * as dateFormat from 'date-format';
import { useSelector } from 'react-redux';

interface IProjectCardProps {
  project: IProjectSettings
}

export const ProjectCard: React.FC<IProjectCardProps> = ({ project }) => {

  const projectState = useSelector((state: AnitaStore) => state.project);

  return (
    <div className=" mt-4 h-full border-2 border-gray-200 border-opacity-60 rounded-lg bg-white">
      <div className="p-6">
        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{project.title}</h1>
        <p className="text-lg mb-3">{project.description}</p>

        <p className="text-gray-600 text-xs">Created on:</p>
        <p className="text-md">{dateFormat('yyyy/MM/dd, at hh:mm', new Date(project.createdAt))}</p>

        <CardFooterItemsEnd>
          <DeleteProjectButton project={project} />
          {(
            projectState === null ||
            projectState[RESERVED_AUDS_KEYS._settings][0].id !== project.id ||
            dbInstances[project.id] === undefined
          ) ? <ProjectNotLoadedFooter project={project} /> : <ProjectLoadedFooter project={project} />}
        </CardFooterItemsEnd>


      </div>
    </div>
  )
}