import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { ISection, SectionElement } from 'app/data/project-structure/project-info';
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { SectionElementSaver } from 'app/Models/Section/SectionElementSaver.class';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum';

export class Section implements ISection {
  public id: string
  public title: string
  public childOf?: Array<string>
  public [RESERVED_FIELDS.createdAt]?: never
  public formModel: Array<FormFieldsModel<SupportedFormsTypes>>;

  constructor(
    private projectId: string,
    section: ISection
  ) {
    this.id = section.id
    this.title = section.title
    this.childOf = section.childOf
    this.formModel = section.formModel
  }

  getAllElements = async (): Promise<Array<SectionElement>> => {
    return dbInstances[this.projectId].callSelector<SectionElement>(this.id).multiple()
  }

  getElementById = (id: string): Promise<SectionElement> => {
    return dbInstances[this.projectId].callSelector<SectionElement>(this.id, { [RESERVED_FIELDS.id]: id }).single();
  }

  saveElement = async (element: SectionElement): Promise<SectionElement> => {
    const mode = element.id ? EDITOR_MODE.edit : EDITOR_MODE.add;
    return new SectionElementSaver(this.projectId, this.id, element, mode).save();
  }

  getFirstUserDefinedField(): FormFieldsModel<SupportedFormsTypes> | undefined {
    return this.formModel.find(formEle => !RESERVED_FIELDS[formEle.fieldName])
  }

  getFirstFieldOfType = (types: Array<FORM_COMPONENTS_CODES>): FormFieldsModel<SupportedFormsTypes> | undefined => {
    return this.formModel.find(formEle => types.includes(parseInt(formEle.componentCode as unknown as string)))
  }

}