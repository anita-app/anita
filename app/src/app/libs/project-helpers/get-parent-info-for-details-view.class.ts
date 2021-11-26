import { dbInstances } from 'app/data/db-instances.const';
import { RESERVED_FIELDS } from 'app/data/form-models/reserved-fields.constant';
import {
  ParentInfoForDetailsView,
  RESERVED_UDS_KEYS,
  SectionElement,
  SystemData
  } from 'app/data/model/project-info';
import { findFirstUserDefinedField } from 'app/libs/tools/find-first-user-defined-field.function';
import { findSectionById } from 'app/libs/tools/find-section-by-id.function';
import { asyncForEach } from 'app/libs/tools/tools';
import { FormModel } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

export class GetParentInfoForDetailsView {

  private parentInfoForDetailsView: Array<ParentInfoForDetailsView> = [];

  constructor(
    private listOfParents: Array<string>,
    private projectId: string,
    private sections: SystemData[RESERVED_UDS_KEYS._sections]
  ) { }

  public async get(): Promise<Array<ParentInfoForDetailsView>> {
    await asyncForEach(this.listOfParents, async sectionIdElementId => await this.processElement(sectionIdElementId));
    return this.parentInfoForDetailsView;
  }

  private async processElement(sectionIdElementId: string): Promise<void> {
    const arrInfo = sectionIdElementId.split('|');
    const element = await dbInstances[this.projectId].callSelector<SectionElement>(arrInfo[0], { [RESERVED_FIELDS.id]: arrInfo[1] }).single();
    const section = findSectionById(this.sections, arrInfo[0]);
    const indexFirstUserFiield = findFirstUserDefinedField(section.formModel as FormModel);
    this.parentInfoForDetailsView.push({
      sectionId: arrInfo[0],
      element,
      txt: element[section.formModel[indexFirstUserFiield].fieldName]
    });
  }
}
