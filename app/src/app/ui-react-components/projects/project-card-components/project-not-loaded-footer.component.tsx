import { ProjectSettings } from 'app/data/project-structure/project-info';
import { ProjectLoader } from 'app/libs/project-helpers/project-handlers/project-loader.class';

export const ProjectNotLoadedFooter = ({ project }: { project: ProjectSettings }) => (
  <button onClick={() => new ProjectLoader(project.id).loadProject()} className="px-4 py-2 text-white ml-auto inline-flex items-center md:mb-2 lg:mb-0 rounded bg-green-500 hover:bg-green-600 text-sm">
    Load project
  </button>
)
