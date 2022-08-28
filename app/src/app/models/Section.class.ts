import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { ISection, SectionElement } from 'app/data/project-structure/project-info';
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';

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
    return dbInstances[this.projectId].callSelector<SectionElement>(this.id, { id }).single();
  }

}