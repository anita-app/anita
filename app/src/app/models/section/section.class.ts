import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { ParentInfoFormEleBuilder } from 'app/models/section/parent-info-form-ele-builder.class'
import { SectionElementSaver } from 'app/models/section/section-element-saver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { SupportedViews } from 'app/models/section/view-settings.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { SyncManager } from 'app/cross-refs-exports'
import { SyncState } from 'app/state/sync/sync-state.class'
import { atom } from 'jotai'
import { Bucket } from 'app/state/bucket.state'
import { ProjectState } from 'app/state/project/project-state.class'
import type { TIconName } from 'app/libs/icons/icons.class'
import type { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISection } from 'app/models/section/section.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

export class Section implements ISection {
  public id: string = ''
  public title: string = ''
  public icon?: TIconName
  public childOf?: Array<string>
  public createdAt: string = ''
  public updatedAt?: string
  public formModel: Array<FormFieldsModel<TSupportedFormsTypes>> = []
  public visibleColumnsInTableView = atom<Array<FormFieldsModel<TSupportedFormsTypes>>>([])
  public sorting = atom<[string, 'asc' | 'desc'] | [null, null]>([null, null])

  constructor (
    private projectId: string,
    private sectionDefinition: ISection = { } as ISection,
  ) {
    if (sectionDefinition) {
      this.id = sectionDefinition.id
      this.title = sectionDefinition.title
      this.icon = sectionDefinition.icon || undefined
      this.childOf = sectionDefinition.childOf
      this.formModel = sectionDefinition.formModel || []
      Bucket.general.set(this.visibleColumnsInTableView, this.getVisibleColumnsInTableView())
      Bucket.general.set(this.sorting, this.getSorting())
      this.createdAt = sectionDefinition[RESERVED_FIELDS.createdAt] || DateTools.getUtcIsoString()
      this.updatedAt = sectionDefinition[RESERVED_FIELDS.updatedAt]
    }
  }

  public getSectionIcon (): TIconName {
    return this.icon || 'chevronForwardOutline'
  }

  public saveElement = async (element: ISectionElement, forceMode?: EDITOR_MODE.add | EDITOR_MODE.edit): Promise<ISectionElement> => {
    SyncState.setIsSavingInFs(true)
    const mode = forceMode || (element.id ? EDITOR_MODE.edit : EDITOR_MODE.add)
    const savedElement = await new SectionElementSaver(this.projectId, this.id, element, mode).save()
    SyncManager.syncWithRemoteOrLocal({ mode, type: 'element', projectId: this.projectId, sectionId: this.id, elementId: savedElement.id!, elementData: savedElement })
    return savedElement
  }

  public deleteElement = async (element: ISectionElement): Promise<void> => {
    SyncState.setIsSavingInFs(true)
    await dbInstances[this.projectId].callDeletor(this.id, { id: element.id }).autoDelete()
    SyncManager.syncWithRemoteOrLocal({ mode: EDITOR_MODE.delete, type: 'element', projectId: this.projectId, sectionId: this.id, elementId: element.id! })
  }

  public getFirstUserDefinedField (): FormFieldsModel<TSupportedFormsTypes> | undefined {
    return this.formModel.find(formEle => !RESERVED_FIELDS[formEle.fieldName!])
  }

  public getFirstFieldOfType = (types: Array<FORM_COMPONENTS_CODES>): FormFieldsModel<TSupportedFormsTypes> | undefined => this.formModel.find(formEle => types.includes(parseInt(formEle.componentCode as unknown as string)))

  public getParentInfoFormEle = (sections: Array<ISection>): FormFieldsModel<ISectionElement> => new ParentInfoFormEleBuilder(this.childOf ?? [], sections).build()

  public getIsHiddenInMenu (): boolean {
    return this.sectionDefinition.viewSettings?.isHiddenInMenu ?? false
  }

  public setIsHiddenInMenu (isHidden: boolean) {
    if (!this.sectionDefinition.viewSettings) {
      this.sectionDefinition.viewSettings = {}
    }
    this.sectionDefinition.viewSettings.isHiddenInMenu = isHidden
    this.saveEditedSection()
  }

  public getPreferredView (): SupportedViews {
    return this.sectionDefinition.viewSettings?.preferredView || SupportedViews.table
  }

  public setPreferredView (view: SupportedViews) {
    if (!this.sectionDefinition.viewSettings) {
      this.sectionDefinition.viewSettings = {}
    }
    this.sectionDefinition.viewSettings.preferredView = view
    this.saveEditedSection()
  }

  public getIsFormEleVisibleInTable (formEleFieldName: string): boolean {
    if (this.sectionDefinition.viewSettings?.table?.formElesVisibility?.[formEleFieldName!] === false) {
      return false
    }
    return true
  }

  public setIsFormEleVisibleInTable (formEleFieldName: string, isVisible: boolean) {
    if (!this.sectionDefinition.viewSettings) {
      this.sectionDefinition.viewSettings = {}
    }
    if (!this.sectionDefinition.viewSettings.table) {
      this.sectionDefinition.viewSettings.table = {}
    }
    if (!this.sectionDefinition.viewSettings.table.formElesVisibility) {
      this.sectionDefinition.viewSettings.table.formElesVisibility = {}
    }
    this.sectionDefinition.viewSettings.table.formElesVisibility[formEleFieldName!] = isVisible
    Bucket.general.set(this.visibleColumnsInTableView, this.getVisibleColumnsInTableView())
    this.saveEditedSection()
  }

  public getVisibleColumnsInTableView (): Array<FormFieldsModel<TSupportedFormsTypes>> {
    return this.formModel.filter(formEle => this.getIsFormEleVisibleInTable(formEle.fieldName!))
  }

  public getSorting (): [string, 'asc' | 'desc'] | [null, null] {
    return this.sectionDefinition.viewSettings?.table?.sorting ?? [null, null]
  }

  public setSorting (sorting: string) {
    if (!this.sectionDefinition.viewSettings) {
      this.sectionDefinition.viewSettings = {}
    }
    if (!this.sectionDefinition.viewSettings.table) {
      this.sectionDefinition.viewSettings.table = {}
    }
    const currentSorting = this.getSorting()
    const order: 'asc' | 'desc' = currentSorting[0] === sorting ? (currentSorting[1] === 'asc' ? 'desc' : 'asc') : 'asc'
    const newSorting: [string, 'asc' | 'desc'] = [sorting, order]
    this.sectionDefinition.viewSettings.table.sorting = newSorting

    Bucket.general.set(this.sorting, newSorting)
    this.saveEditedSection()
  }

  private saveEditedSection = async (): Promise<void> => {
    new SectionElementSaver(this.projectId, RESERVED_AUDS_KEYS._sections, this.sectionDefinition, EDITOR_MODE.edit).save()
    ProjectState.updateSection(this.sectionDefinition)
  }
}
