import { ArrayTools } from 'app/libs/tools/array-tools.class'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Bucket } from 'app/state/bucket.state'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { Project } from 'app/models/project/project.class'
import type { IOptionKeysModel, OptionKeysModelGroup } from 'app/components/shared-components/forms-automator/form-automator.types'

export class GetOptionsForParentsSelector {
  private optionsGroups: Array<OptionKeysModelGroup> = []

  constructor (
    private project: Project,
  ) {
  }

  public async buildOptions (options: Array<IOptionKeysModel>): Promise<Array<OptionKeysModelGroup>> {
    await ArrayTools.asyncForEach(options, async (group, index) => {
      const sectionEles = await Queriers.getElements(this.project.getId(), group?.value?.toString?.()!) || []
      if (sectionEles.length) {
        this.createGroupOption(group.value as string, group.label || `Option ${index + 1}`, sectionEles)
      }
    })

    return this.optionsGroups
  }

  private createGroupOption (sectionId: string, sectionLabel: string, sectionEles: Array<ISectionElement>): void {
    const options: Array<IOptionKeysModel> = []
    const section = Bucket.general.get(ProjectAtoms.currentProject)?.getSectionById(sectionId)
    if (!section) {
      return
    }
    const formEle = section.getFirstUserDefinedField()
    sectionEles.forEach(ele => options.push({
      value: `${sectionId}|${ele.id}`,
      label: ele[formEle!.fieldName],
    }))
    this.optionsGroups.push({
      label: sectionLabel,
      options,
    })
  }
}
