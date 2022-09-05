import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { ISection, SectionElement } from 'app/data/project-structure/project-info'
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { ParentInfoFormEleBuilder } from 'app/models/section/parent-info-form-ele-builder.class'
import { SectionElementSaver } from 'app/models/section/section-element-saver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { TIconName } from 'app/libs/icons/icons.class'
import { Project } from 'app/models/project/project.class'
import { SupportedViews } from 'app/models/section/view-settings.const'

export class Section implements ISection {
  public id: string
  public title: string
  public icon?: TIconName
  public childOf?: Array<string>
  public [RESERVED_FIELDS.createdAt]?: never
  public formModel: Array<FormFieldsModel<TSupportedFormsTypes>>

  constructor (
    private project: Project,
    private projectId: string,
    private allSections: Array<ISection>,
    private sectionData: ISection = {} as ISection
  ) {
    this.id = sectionData.id
    this.title = sectionData.title
    this.icon = sectionData.icon || undefined
    this.childOf = sectionData.childOf
    this.formModel = sectionData.formModel
  }

  public getSectionIcon (): TIconName {
    return this.icon || 'chevronForwardOutline'
  }

  public getAllElements = async (): Promise<Array<SectionElement>> => dbInstances[this.projectId].callSelector<SectionElement>(this.id).multiple()

  public getElementById = (id: string): Promise<SectionElement | void> => dbInstances[this.projectId].callSelector<SectionElement>(this.id, { [RESERVED_FIELDS.id]: id }).single()

  public saveElement = async (element: SectionElement): Promise<SectionElement> => {
    const mode = element.id ? EDITOR_MODE.edit : EDITOR_MODE.add
    return new SectionElementSaver(this.projectId, this.id, element, mode).save()
  }

  public getFirstUserDefinedField (): FormFieldsModel<TSupportedFormsTypes> | undefined {
    return this.formModel.find(formEle => !RESERVED_FIELDS[formEle.fieldName!])
  }

  public getFirstFieldOfType = (types: Array<FORM_COMPONENTS_CODES>): FormFieldsModel<TSupportedFormsTypes> | undefined => this.formModel.find(formEle => types.includes(parseInt(formEle.componentCode as unknown as string)))

  public getParentInfoFormEle = (): FormFieldsModel<SectionElement> => new ParentInfoFormEleBuilder(this.childOf ?? [], this.allSections).build()

  public getPreferredView (): SupportedViews {
    return this.sectionData.viewSettings?.preferredView || SupportedViews.table
  }

  public setPreferredView (view: SupportedViews) {
    if (!this.sectionData.viewSettings) {
      this.sectionData.viewSettings = {}
    }
    this.sectionData.viewSettings.preferredView = view
    this.project.saveProject()
  }
}
