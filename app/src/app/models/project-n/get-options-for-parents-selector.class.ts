import { SectionElement } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/manager-n/manager.class'
import { ArrayTools } from 'app/libs/tools/array-tools.class'
import { Project } from 'app/models/project-n/project.class'
import { IOptionKeysModel, OptionKeysModelGroup } from 'app/components/shared-components/forms-automator/form-automator.types'

export class GetOptionsForParentsSelector {
  private optionsGroups: Array<OptionKeysModelGroup> = []

  constructor (
    private project: Project
  ) {
  }

  public async buildOptions (options: Array<IOptionKeysModel>): Promise<Array<OptionKeysModelGroup>> {
    await ArrayTools.asyncForEach(options, async (group, index) => {
      const sectionEles = await this.project.getSectionById(group?.value?.toString?.())?.getAllElements() || []
      if (sectionEles.length) {
        this.createGroupOption(group.value as string, group.label || `Option ${index + 1}`, sectionEles)
      }
    })

    return this.optionsGroups
  }

  private createGroupOption (sectionId: string, sectionLabel: string, sectionEles: Array<SectionElement>): void {
    const options: Array<IOptionKeysModel> = []
    const section = Manager.getCurrentProject()?.getSectionById(sectionId)
    if (!section) {
      return
    }
    const formEle = section.getFirstUserDefinedField()
    sectionEles.forEach(ele => options.push({
      value: `${sectionId}|${ele.id}`,
      label: ele[formEle!.fieldName]
    }))
    this.optionsGroups.push({
      label: sectionLabel,
      options
    })
  }
}
