import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { Project } from 'app/models/project/project.class'
import { ProjectLoader } from 'app/models/project/project-loader.class'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectDataImporter } from 'app/libs/projects-helpers/project-importers/project-data-importer.class'
import { ProjectState } from 'app/state/project/project-state.class'
import type { TAnitaUniversalDataStorage, IProjectSettings, LocalProjectSettings, TSystemData } from 'app/models/project/project.declarations'

export class Manager {
  private static currentProject: Project

  public static loadProjectById (projectId: string): Promise<void> {
    return new ProjectLoader(projectId).loadProject()
  }

  public static saveProject = (systemData: TSystemData, mode: EDITOR_MODE.add | EDITOR_MODE.edit): Promise<TSystemData> => (
    new ProjectSaver(systemData, mode).save()
  )

  public static setCurrentProject (systemData: TSystemData) {
    const systemDataClone = {
      [RESERVED_AUDS_KEYS._settings]: [{ ...systemData[RESERVED_AUDS_KEYS._settings][0] }],
      [RESERVED_AUDS_KEYS._sections]: [...systemData[RESERVED_AUDS_KEYS._sections]],
    }
    this.currentProject = new Project(systemDataClone)
    ProjectState.setCurrentProject(systemDataClone)
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

  public static async importProject (projectData: TAnitaUniversalDataStorage): Promise<void> {
    const projectInfo = await new ProjectDataImporter(projectData).import()
    await new ProjectLoader(projectData[RESERVED_AUDS_KEYS._settings][0].id, projectInfo).loadProject()
    await this.saveProject({ [RESERVED_AUDS_KEYS._settings]: projectData[RESERVED_AUDS_KEYS._settings], [RESERVED_AUDS_KEYS._sections]: projectData[RESERVED_AUDS_KEYS._sections] }, EDITOR_MODE.edit)
  }

  private static loadCurrentProjectFromStore () {
    const projectInStore = ProjectState.getCurrentProject()
    if (projectInStore) {
      this.currentProject = new Project(projectInStore)
    }
  }

  private static async isProjectLoaded (projectId: string): Promise<boolean> {
    if (typeof dbInstances?.[projectId]?.callSelector === 'function') {
      return true
    }

    const projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single()

    if (projectInfo) {
      await new ProjectLoader(projectId, projectInfo).loadProject()
      return true
    }

    return false
  }
}
