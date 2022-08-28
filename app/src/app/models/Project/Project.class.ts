import { RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info';
import { ProjectDeletor } from 'app/Models/Project/ProjectDeletor.class';
import { ProjectExporter } from 'app/Models/Project/ProjectExporter.class';
import { Section } from 'app/Models/Section/Section.class';

export class Project {

  private settings: SystemData[RESERVED_AUDS_KEYS._settings][0]
  private sectionsDefinitions: SystemData[RESERVED_AUDS_KEYS._sections]
  private sections: { [key: string]: Section } = {}

  constructor(
    systemData: SystemData
  ) {
    this.settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    this.sectionsDefinitions = systemData[RESERVED_AUDS_KEYS._sections]
  }

  getId = () => {
    return this.settings.id
  }

  getSettings = () => {
    return this.settings
  }

  getSectionsDefinitions = () => {
    return this.sectionsDefinitions
  }

  export = () => {
    new ProjectExporter({
      [RESERVED_AUDS_KEYS._settings]: [this.settings],
      [RESERVED_AUDS_KEYS._sections]: this.sectionsDefinitions
     }).export()
  }

  delete = async () => {
    new ProjectDeletor(this.settings).delete();
  }
  
  getSectionById = (sectionId: string): Section => {
    if (!this.sections[sectionId]) {
      this.sections[sectionId] = new Section(this.getId(), this.sectionsDefinitions.find(section => section.id === sectionId))
    }
    return this.sections[sectionId]
  }

}