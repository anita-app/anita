import { SectionElement } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { asyncForEach } from 'app/libs/tools/tools'
import { Project } from 'app/Models/Project/Project.class'
import { OptionKeysModel, OptionKeysModelGroup } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

export class GetOptionsForParentsSelector {
  private optionsGroups: Array<OptionKeysModelGroup> = []

  constructor (
    private project: Project
  ) {
  }

  public async buildOptions (options: Array<OptionKeysModel>): Promise<Array<OptionKeysModelGroup>> {
    await asyncForEach(options, async group => {
      const sectionEles = await this.project.getSectionById(group.value.toString()).getAllElements()
      if (sectionEles.length) {
        this.createGroupOption(group.value as string, group.label, sectionEles)
      }
    })

    return this.optionsGroups
  }

  private createGroupOption (sectionId: string, sectionLabel: string, sectionEles: Array<SectionElement>): void {
    const options: Array<OptionKeysModel> = []
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
