import { SectionElement } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { ArrayTools } from 'app/libs/Tools/ArrayTools.class'
import { Project } from 'app/Models/Project/Project.class'
import { IOptionKeysModel, OptionKeysModelGroup } from 'app/Components/shared-components/forms-automator/form-automator.types'

export class GetOptionsForParentsSelector {
  private optionsGroups: Array<OptionKeysModelGroup> = []

  constructor (
    private project: Project
  ) {
  }

  public async buildOptions (options: Array<IOptionKeysModel>): Promise<Array<OptionKeysModelGroup>> {
    await ArrayTools.asyncForEach(options, async group => {
      const sectionEles = await this.project.getSectionById(group.value.toString()).getAllElements()
      if (sectionEles.length) {
        this.createGroupOption(group.value as string, group.label, sectionEles)
      }
    })

    return this.optionsGroups
  }

  private createGroupOption (sectionId: string, sectionLabel: string, sectionEles: Array<SectionElement>): void {
    const options: Array<IOptionKeysModel> = []
    const section = Manager.getCurrentProject().getSectionById(sectionId)
    const formEle = Manager.getCurrentProject().getSectionById(section.id).getFirstUserDefinedField()
    sectionEles.forEach(ele => options.push({
      value: `${sectionId}|${ele.id}`,
      label: ele[formEle.fieldName]
    }))
    this.optionsGroups.push({
      label: sectionLabel,
      options
    })
  }
}
