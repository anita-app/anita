import { IProjectSettings, ISection, ParentInfoForDetailsView, RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { GetOptionsForParentsSelector } from 'app/Models/Project/GetOptionsForParentsSelector.class'
import { GetParentInfoForDetailsView } from 'app/Models/Project/GetParentInfoForDetailsView.class'
import { ProjectDeletor } from 'app/Models/Project/ProjectDeletor.class'
import { ExportScope, ProjectExporter } from 'app/Models/Project/ProjectExporter.class'
import { Section } from 'app/Models/Section/Section.class'
import { IOptionKeysModel, OptionKeysModelGroup } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

export class Project {
  private settings: SystemData[RESERVED_AUDS_KEYS._settings][0]
  private sectionsDefinitions: SystemData[RESERVED_AUDS_KEYS._sections]
  private sections: { [key: string]: Section } = {}

  constructor (
    systemData: SystemData
  ) {
    this.settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    this.sectionsDefinitions = systemData[RESERVED_AUDS_KEYS._sections]
  }

  public getId = (): string => this.settings.id

  public getSettings = (): IProjectSettings => this.settings

  public getSectionsDefinitions = (): Array<ISection> => this.sectionsDefinitions

  public export = (scope: ExportScope): void => {
    new ProjectExporter({
      [RESERVED_AUDS_KEYS._settings]: [this.settings],
      [RESERVED_AUDS_KEYS._sections]: this.sectionsDefinitions
    }).export(scope)
  }

  public delete = (): void => {
    new ProjectDeletor(this.settings).delete()
  }

  public getSectionById = (sectionId: string): Section => {
    if (!this.sections[sectionId]) {
      this.sections[sectionId] = new Section(
        this.getId(),
        this.getSectionsDefinitions(),
        this.sectionsDefinitions.find(section => section.id === sectionId)
      )
    }
    return this.sections[sectionId]
  }

  public getParentInfoForDetailsView = (listOfParents: Array<string>): Promise<Array<ParentInfoForDetailsView>> => new GetParentInfoForDetailsView(this, listOfParents).get()

  public getOptionsForParentsSelector = (options: Array<IOptionKeysModel>): Promise<Array<OptionKeysModelGroup>> => new GetOptionsForParentsSelector(this).buildOptions(options)
}
