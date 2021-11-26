import { dbInstances } from 'app/data/db-instances.const';
import {
  ParentInfoForDetailsView,
  RESERVED_AUDS_KEYS,
  SectionElement,
  SystemData
  } from 'app/data/project-structure/project-info';
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { findFirstUserDefinedField } from 'app/libs/tools/find-first-user-defined-field.function';
import { findSectionById } from 'app/libs/tools/find-section-by-id.function';
import { asyncForEach } from 'app/libs/tools/tools';
import { FormModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';

export class GetParentInfoForDetailsView {

  private parentInfoForDetailsView: Array<ParentInfoForDetailsView> = [];

  constructor(
    private listOfParents: Array<string>,
    private projectId: string,
    private sections: SystemData[RESERVED_AUDS_KEYS._sections]
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
