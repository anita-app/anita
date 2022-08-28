import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum';
import { LocalProjectSettings, SystemData } from 'app/data/project-structure/project-info'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum';
import { ProjectLoader } from 'app/libs/project-helpers/project-handlers/project-loader.class';
import { store } from 'app/libs/redux/state.store'
import { Project } from 'app/models/Project.class'

export class Manager {

  private static currentProject: Project

  public static setCurrentProject(systemData: SystemData) {
    this.currentProject = new Project(systemData)
  }

  public static getCurrentProject() {
    if (!this.currentProject) {
      this.loadCurrentProjectFromStore()
    }
    return this.currentProject
  }

  public static getProjectById = async (projectId: string | undefined): Promise<Project | undefined> => {
    if (projectId && await this.isProjectLoaded(projectId)) {
      return this.currentProject
    }
  }

  private static loadCurrentProjectFromStore() {
    const projectInStore = store.getState().project
    if (projectInStore) {
      this.currentProject = new Project(projectInStore)
    } else {
      throw new Error('No project in store')
    }
  }

  private static async isProjectLoaded(projectId: string, setProject = true): Promise<boolean> {

    if (typeof dbInstances?.[projectId]?.callSelector === 'function')
      return true;
  
    const projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single();
  
    // Relaxed equality check, because localStorage prop is a string
    // eslint-disable-next-line eqeqeq
    if (projectInfo.localStorage == LOCAL_STORAGE_SYSTEMS.IndexedDB) {
      await new ProjectLoader(projectId, projectInfo, setProject).loadProject();
      return true;
    }
  
    return false;
  }

}