import { ParentInfoForDetailsView } from 'app/data/project-structure/project-info'
import { ArrayTools } from 'app/libs/tools/ArrayTools.class'
import { Project } from 'app/models/Project/Project.class'

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
    const element = await this.project.getSectionById(section.id).getElementById(arrInfo[1])
    const formEle = this.project.getSectionById(section.id).getFirstUserDefinedField()
    this.parentInfoForDetailsView.push({
      sectionId: arrInfo[0],
      element,
      txt: element[formEle.fieldName]
    })
  }
}
