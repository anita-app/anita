import { RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info';
import { ProjectDeletor } from 'app/libs/project-helpers/project-handlers/project-deletor.class';
import { Section } from 'app/models/Section.class';

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