import { ParentInfoForDetailsView } from 'app/data/project-structure/project-info'
import { ArrayTools } from 'app/libs/tools/array-tools.class'
import { Project } from 'app/models/project/project.class'

export class GetParentInfoForDetailsView {
  private parentInfoForDetailsView: Array<ParentInfoForDetailsView> = []

  constructor (
    private project: Project,
    private listOfParents: Array<string>
  ) { }

  public async get (): Promise<Array<ParentInfoForDetailsView>> {
    await ArrayTools.asyncForEach(this.listOfParents, async sectionIdElementId => await this.processElement(sectionIdElementId))
    return this.parentInfoForDetailsView
  }

  private async processElement (sectionIdElementId: string): Promise<void> {
    const arrInfo = sectionIdElementId.split('|')
    const section = this.project.getSectionById(arrInfo[0])
    if (!section) {
      return
    }
    const element = await section.getElementById(arrInfo[1])
    const formEle = section.getFirstUserDefinedField()
    this.parentInfoForDetailsView.push({
      sectionId: arrInfo[0],
      element: element!,
      txt: element[formEle?.fieldName!]
    })
  }
}
