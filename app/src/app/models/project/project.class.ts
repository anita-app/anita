import { IProjectSettings, RESERVED_AUDS_KEYS, TAnitaUniversalDataStorage, TSystemData } from 'app/models/project/project.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { GetOptionsForParentsSelector } from 'app/models/project/get-options-for-parents-selector.class'
import { GetParentInfoForDetailsView } from 'app/models/project/get-parent-info-for-details-view.class'
import { ProjectDeletor } from 'app/models/project/project-deletor.class'
import { ExportScope, ProjectExporter } from 'app/models/project/project-exporter.class'
import { Section } from 'app/models/section/section.class'
import { IOptionKeysModel, OptionKeysModelGroup } from 'app/components/shared-components/forms-automator/form-automator.types'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ParentInfoForDetailsView } from 'app/models/parent-element/parent-element.declarations'
import { ProjectUploader } from 'app/models/project/syncing/project-uploader'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'

export class Project {
  private settings: TSystemData[RESERVED_AUDS_KEYS._settings][0]
  private sectionsDefinitions: TSystemData[RESERVED_AUDS_KEYS._sections]
  private sections: { [key: string]: Section } = {}

  constructor (
    private systemData: TSystemData
  ) {
    this.settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    this.sectionsDefinitions = systemData[RESERVED_AUDS_KEYS._sections]
  }

  public getId = (): string => this.settings.id

  public getSettings = (): IProjectSettings => this.settings

  public getSectionsDefinitions = (): Array<ISection> => this.sectionsDefinitions || []

  public export = (scope: ExportScope): void => {
    new ProjectExporter({
      [RESERVED_AUDS_KEYS._settings]: [this.settings],
      [RESERVED_AUDS_KEYS._sections]: this.sectionsDefinitions
    }).exportToFile(scope)
  }

  public getAllData = (): Promise<TAnitaUniversalDataStorage> => new ProjectExporter(this.systemData).getData(ExportScope.all)

  public uploadToCloudService = (path: string): void => {
    new ProjectUploader({
      [RESERVED_AUDS_KEYS._settings]: [this.settings],
      [RESERVED_AUDS_KEYS._sections]: this.sectionsDefinitions
    }).uploadToCloudService(path)
  }

  public delete = (): void => {
    new ProjectDeletor(this.settings).delete()
  }

  public getSectionById = (sectionId: string | undefined): Section | null => {
    if (!sectionId) {
      return null
    }
    if (!this.sections[sectionId]) {
      const sectionData = this.getSectionDataById(sectionId)
      if (!sectionData) {
        return null
      }
      this.sections[sectionId] = new Section(
        this.getId(),
        this.getSectionsDefinitions(),
        sectionData
      )
    }
    return this.sections[sectionId]
  }

  public getSystemData = (): TSystemData => this.systemData

  public updateSystemData = async (systemData: TSystemData): Promise<void> => {
    this.settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    this.sectionsDefinitions = systemData[RESERVED_AUDS_KEYS._sections]
    this.systemData = await this.saveProject()
    const systemDataClone = JSON.parse(JSON.stringify(this.systemData))
    storeDispatcher(({
      type: REDUX_ACTIONS.setCurrentProject,
      payload: systemDataClone
    }))
  }

  public getProjectProp = (key: keyof IProjectSettings): any => this.systemData[RESERVED_AUDS_KEYS._settings][0][key]

  public getParentInfoForDetailsView = (listOfParents: Array<string>): Promise<Array<ParentInfoForDetailsView>> => new GetParentInfoForDetailsView(this, listOfParents).get()

  public getOptionsForParentsSelector = (options: Array<IOptionKeysModel>): Promise<Array<OptionKeysModelGroup>> => new GetOptionsForParentsSelector(this).buildOptions(options)

  private saveProject = (): Promise<TSystemData> => (
    new ProjectSaver(this.systemData, EDITOR_MODE.edit).save()
  )

  private getSectionDataById = (sectionId: string): ISection | undefined => (
    this.sectionsDefinitions.find(section => section.id === sectionId)
  )
}
