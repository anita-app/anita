import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { LocalProjectSettings, RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { store } from 'app/libs/redux/state.store'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { Project } from 'app/models/Project/Project.class'
import { ProjectLoader } from 'app/models/Project/ProjectLoader.class'
import { ProjectSaver } from 'app/models/Project/ProjectSaver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'

export class Manager {
  private static currentProject: Project

  public static loadProjectById (projectId: string): Promise<void> {
    return new ProjectLoader(projectId).loadProject()
  }

  public static saveProject = (systemData: SystemData, mode: EDITOR_MODE): Promise<SystemData> => new ProjectSaver(systemData, mode).save()

  public static setCurrentProject (systemData: SystemData) {
    const systemDataClone = {
      [RESERVED_AUDS_KEYS._settings]: [{ ...systemData[RESERVED_AUDS_KEYS._settings][0] }],
      [RESERVED_AUDS_KEYS._sections]: [...systemData[RESERVED_AUDS_KEYS._sections]]
    }
    this.currentProject = new Project(systemDataClone)
    storeDispatcher(({
      type: REDUX_ACTIONS.setCurrentProject,
      payload: systemDataClone
    }))
  }

  public static getCurrentProject () {
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

  private static loadCurrentProjectFromStore () {
    const projectInStore = store.getState().project
    if (projectInStore) {
      this.currentProject = new Project(projectInStore)
    } else {
      throw new Error('No project in store')
    }
  }

  private static async isProjectLoaded (projectId: string): Promise<boolean> {
    if (typeof dbInstances?.[projectId]?.callSelector === 'function') {
      return true
    }

    const projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single()

    // Relaxed equality check, because localStorage prop is a string
    // eslint-disable-next-line eqeqeq
    if (projectInfo.localStorage == LOCAL_STORAGE_SYSTEMS.IndexedDB) {
      await new ProjectLoader(projectId, projectInfo).loadProject()
      return true
    }

    return false
  }
}
