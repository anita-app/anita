import {
  ParentInfoForDetailsView,
  RESERVED_AUDS_KEYS,
  SystemData
  } from 'app/data/project-structure/project-info';
import { Manager } from 'app/libs/Manager/Manager.class';
import { asyncForEach } from 'app/libs/tools/tools';

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
    const section = Manager.getCurrentProject().getSectionById(arrInfo[0]);
    const element = await Manager.getCurrentProject().getSectionById(section.id).getElementById(arrInfo[1]);
    const formEle = Manager.getCurrentProject().getSectionById(section.id).getFirstUserDefinedField();
    this.parentInfoForDetailsView.push({
      sectionId: arrInfo[0],
      element,
      txt: element[formEle.fieldName]
    });
  }
}
