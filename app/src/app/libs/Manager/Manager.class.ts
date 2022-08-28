import { IProjectSettings } from 'app/data/project-structure/project-info'
import { store } from 'app/libs/redux/state.store'
import { Project } from 'app/models/Project.class'

export class Manager {

  private static currentProject: Project

  public static setCurrentProject(projectSettings: IProjectSettings) {
    this.currentProject = new Project(projectSettings)
  }

  public static getCurrentProject() {
    if (!this.currentProject) {
      this.loadCurrentProjectFromStore()
    }
    return this.currentProject
  }

  private static loadCurrentProjectFromStore() {
    const projectInStore = store.getState().project
    if (projectInStore) {
      this.currentProject = new Project(projectInStore._settings[0])
    } else {
      throw new Error('No project in store')
    }
  }

}