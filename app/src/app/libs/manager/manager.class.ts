import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { TAnitaUniversalDataStorage, IProjectSettings, LocalProjectSettings, RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { store } from 'app/libs/redux/state.store'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { Project } from 'app/models/project/project.class'
import { ProjectLoader } from 'app/models/project/project-loader.class'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { ProjectDataImporter } from 'app/libs/projects-helpers/project-importers/project-data-importer.class'
import { ProjectsListLoader } from 'app/libs/projects-helpers/projects-handlers/projects-list-loader.class'

export class Manager {
  private static currentProject: Project

  /**
   * Loads the projects from IndexedDB and adds them to the current state
   */
  public static loadProjectsList (): Promise<void> {
    return new ProjectsListLoader().load()
  }

  public static loadProjectById (projectId: string): Promise<void> {
    return new ProjectLoader(projectId).loadProject()
  }

  public static saveProject = (systemData: TSystemData, mode: EDITOR_MODE): Promise<TSystemData> => (
    new ProjectSaver(systemData, mode).save()
  )

  public static setCurrentProject (systemData: TSystemData) {
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

  public static getCurrentProject (): Project | undefined {
    if (!this.currentProject) {
      this.loadCurrentProjectFromStore()
    }
    return this.currentProject
  }

  public static getProjectById = async (projectId: string | undefined, initialize: boolean = false): Promise<Project | undefined> => {
    if (projectId && await this.isProjectLoaded(projectId)) {
      return this.currentProject
    }
    if (initialize) {
      return new Project({ [RESERVED_AUDS_KEYS._settings]: [{ id: projectId } as IProjectSettings], [RESERVED_AUDS_KEYS._sections]: [] })
    }
  }

  public static async importProject (projectData: TAnitaUniversalDataStorage, fileHandle?: FileSystemFileHandle): Promise<void> {
    const projectInfo = await new ProjectDataImporter(projectData!, fileHandle).import()
    await new ProjectLoader(projectData[RESERVED_AUDS_KEYS._settings][0].id, projectInfo).loadProject()
    await this.saveProject({ [RESERVED_AUDS_KEYS._settings]: projectData[RESERVED_AUDS_KEYS._settings], [RESERVED_AUDS_KEYS._sections]: projectData[RESERVED_AUDS_KEYS._sections] }, EDITOR_MODE.edit)
  }

  private static loadCurrentProjectFromStore () {
    const projectInStore = store.getState().project
    if (projectInStore) {
      this.currentProject = new Project(projectInStore)
    }
  }

  private static async isProjectLoaded (projectId: string): Promise<boolean> {
    if (typeof dbInstances?.[projectId]?.callSelector === 'function') {
      return true
    }

    const projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single()

    // Relaxed equality check, because localStorage prop is a string
    // eslint-disable-next-line eqeqeq
    if (projectInfo?.localStorage == LOCAL_STORAGE_SYSTEMS.IndexedDB) {
      await new ProjectLoader(projectId, projectInfo).loadProject()
      return true
    }

    return false
  }
}
