import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { ParentInfoFormEleBuilder } from 'app/models/section/parent-info-form-ele-builder.class'
import { SectionElementSaver } from 'app/models/section/section-element-saver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { TIconName } from 'app/libs/icons/icons.class'
import { SupportedViews } from 'app/models/section/view-settings.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { Subject } from 'rxjs'
import { SyncManager } from 'app/libs/cloud-sync/sync-manager.class'
import { CURRENT_PROJECT_SYNC_INFO } from 'app/libs/cloud-sync/sync-manager.const'

export class Section implements ISection {
  public id: string
  public title: string
  public icon?: TIconName
  public childOf?: Array<string>
  public [RESERVED_FIELDS.createdAt]?: never
  public formModel: Array<FormFieldsModel<TSupportedFormsTypes>>
  public visibleColumnsInTableView = new Subject<Array<FormFieldsModel<TSupportedFormsTypes>>>()
  public sorting = new Subject<[string, 'asc' | 'desc'] | [null, null]>()

  constructor (
    private projectId: string,
    private allSections: Array<ISection>,
    private sectionData: ISection = {} as ISection
  ) {
    this.id = sectionData.id
    this.title = sectionData.title
    this.icon = sectionData.icon || undefined
    this.childOf = sectionData.childOf
    this.formModel = sectionData.formModel
    this.visibleColumnsInTableView.next(this.getVisibleColumnsInTableView())
    this.sorting.next(this.getSorting())
  }

  public getSectionIcon (): TIconName {
    return this.icon || 'chevronForwardOutline'
  }

  public getAllElements = async (): Promise<Array<ISectionElement>> => dbInstances[this.projectId].callSelector<ISectionElement>(this.id).multiple()

  public getElementById = (id: string): Promise<ISectionElement | void> => dbInstances[this.projectId].callSelector<ISectionElement>(this.id, { [RESERVED_FIELDS.id]: id }).single()

  public saveElement = async (element: ISectionElement, forceMode?: EDITOR_MODE): Promise<ISectionElement> => {
    const mode = forceMode || (element.id ? EDITOR_MODE.edit : EDITOR_MODE.add)
    const savedElement = await new SectionElementSaver(this.projectId, this.id, element, mode).save()
    if (SyncManager.canStartSync()) {
      new SyncManager(CURRENT_PROJECT_SYNC_INFO.linkedFileId!).sync()
    }
    return savedElement
  }

  public deleteElement = async (element: ISectionElement): Promise<void> => {
    await dbInstances[this.projectId].callDeletor(this.id, { id: element.id }).autoDelete()
    if (SyncManager.canStartSync()) {
      new SyncManager(CURRENT_PROJECT_SYNC_INFO.linkedFileId!).sync()
    }
  }

  public getFirstUserDefinedField (): FormFieldsModel<TSupportedFormsTypes> | undefined {
    return this.formModel.find(formEle => !RESERVED_FIELDS[formEle.fieldName!])
  }

  public getFirstFieldOfType = (types: Array<FORM_COMPONENTS_CODES>): FormFieldsModel<TSupportedFormsTypes> | undefined => this.formModel.find(formEle => types.includes(parseInt(formEle.componentCode as unknown as string)))

  public getParentInfoFormEle = (): FormFieldsModel<ISectionElement> => new ParentInfoFormEleBuilder(this.childOf ?? [], this.allSections).build()

  public getIsHiddenInMenu (): boolean {
    return this.sectionData.viewSettings?.isHiddenInMenu ?? false
  }

  public setIsHiddenInMenu (isHidden: boolean) {
    if (!this.sectionData.viewSettings) {
      this.sectionData.viewSettings = {}
    }
    this.sectionData.viewSettings.isHiddenInMenu = isHidden
    this.saveEditedSection()
  }

  public getPreferredView (): SupportedViews {
    return this.sectionData.viewSettings?.preferredView || SupportedViews.table
  }

  public setPreferredView (view: SupportedViews) {
    if (!this.sectionData.viewSettings) {
      this.sectionData.viewSettings = {}
    }
    this.sectionData.viewSettings.preferredView = view
    this.saveEditedSection()
  }

  public getIsFormEleVisibleInTable (formEleFieldName: string): boolean {
    return this.sectionData.viewSettings?.table?.formElesVisibility?.[formEleFieldName!] !== false ?? true
  }

  public setIsFormEleVisibleInTable (formEleFieldName: string, isVisible: boolean) {
    if (!this.sectionData.viewSettings) {
      this.sectionData.viewSettings = {}
    }
    if (!this.sectionData.viewSettings.table) {
      this.sectionData.viewSettings.table = {}
    }
    if (!this.sectionData.viewSettings.table.formElesVisibility) {
      this.sectionData.viewSettings.table.formElesVisibility = {}
    }
    this.sectionData.viewSettings.table.formElesVisibility[formEleFieldName!] = isVisible
    this.visibleColumnsInTableView.next(this.getVisibleColumnsInTableView())
    this.saveEditedSection()
  }

  public getVisibleColumnsInTableView (): Array<FormFieldsModel<TSupportedFormsTypes>> {
    return this.formModel.filter(formEle => this.getIsFormEleVisibleInTable(formEle.fieldName!))
  }

  public getSorting (): [string, 'asc' | 'desc'] | [null, null] {
    return this.sectionData.viewSettings?.table?.sorting ?? [null, null]
  }

  public setSorting (sorting: string) {
    if (!this.sectionData.viewSettings) {
      this.sectionData.viewSettings = {}
    }
    if (!this.sectionData.viewSettings.table) {
      this.sectionData.viewSettings.table = {}
    }
    const currentSorting = this.getSorting()
    const order: 'asc' | 'desc' = currentSorting[0] === sorting ? (currentSorting[1] === 'asc' ? 'desc' : 'asc') : 'asc'
    const newSorting: [string, 'asc' | 'desc'] = [sorting, order]
    this.sectionData.viewSettings.table.sorting = newSorting

    this.sorting.next(newSorting)
    this.saveEditedSection()
  }

  private saveEditedSection = async (): Promise<void> => {
    new SectionElementSaver(this.projectId, RESERVED_AUDS_KEYS._sections, this.sectionData, EDITOR_MODE.edit).save()
    storeDispatcher({ type: REDUX_ACTIONS.updateSection, payload: this.sectionData })
  }
}
