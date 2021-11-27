import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum';
import { LocalProjectSettings } from 'app/data/project-structure/project-info';
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum';
import { ProjectLoader } from 'app/libs/project-helpers/project-handlers/project-loader.class';

export async function isProjectLoaded(projectId: string): Promise<boolean> {

  if (typeof dbInstances?.[projectId]?.callSelector === 'function')
    return true;

  const projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single();

  if (projectInfo.localStorage === LOCAL_STORAGE_SYSTEMS.IndexedDB) {
    await new ProjectLoader(projectId, projectInfo).loadProject();
    return true;
  }

  return false;
}