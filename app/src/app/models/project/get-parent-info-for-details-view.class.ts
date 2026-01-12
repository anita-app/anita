import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { ArrayTools } from 'app/libs/tools/array-tools.class'
import { Section } from 'app/models/section/section.class'
import type { ParentInfoForDetailsView } from 'app/models/parent-element/parent-element.declarations'
import type { Project } from 'app/models/project/project.class'

export class GetParentInfoForDetailsView {
  private parentInfoForDetailsView: Array<ParentInfoForDetailsView> = []

  constructor (
    private project: Project,
    private listOfParents: Array<string>,
  ) { }

  public async get (): Promise<Array<ParentInfoForDetailsView>> {
    await ArrayTools.asyncForEach(this.listOfParents, async sectionIdElementId => await this.processElement(sectionIdElementId))
    return this.parentInfoForDetailsView
  }

  private async processElement (sectionIdElementId: string): Promise<void> {
    const arrInfo = sectionIdElementId.split('|')
    const sectionId = arrInfo[0]
    const elementId = arrInfo[1]

    if (!sectionId || !elementId) {
      return
    }

    const sectionData = await Queriers.getProjectSection(this.project.getId(), sectionId)

    if (!sectionData) {
      return
    }

    const section = new Section(this.project.getId(), sectionData)
    const element = await Queriers.getElement(this.project.getId(), sectionId, elementId)

    if (!element) {
      return
    }

    const formEle = section.getFirstUserDefinedField()
    this.parentInfoForDetailsView.push({
      sectionId: arrInfo[0],
      element: element!,
      txt: element[formEle?.fieldName!],
    })
  }
}
