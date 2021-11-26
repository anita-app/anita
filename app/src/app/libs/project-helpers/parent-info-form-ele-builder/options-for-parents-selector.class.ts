import { dbInstances } from 'app/data/db-instances.const';
import { RESERVED_AUDS_KEYS, SectionElement, SystemData } from 'app/data/project-structure/project-info';
import { findFirstUserDefinedField } from 'app/libs/tools/find-first-user-defined-field.function';
import { findSectionById } from 'app/libs/tools/find-section-by-id.function';
import { asyncForEach } from 'app/libs/tools/tools';
import { FormModel, OptionKeysModel, OptionKeysModelGroup } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';

export class OptionsForParentsSelector {

  private optionsGroups: Array<OptionKeysModelGroup> = [];

  constructor(
    private project: SystemData,
    private options: Array<OptionKeysModel>
  ) {
  }
  public async buildOptions(): Promise<Array<OptionKeysModelGroup>> {
    await asyncForEach(this.options, async group => {
      const sectionEles = await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callSelector<SectionElement>(group.value).multiple();
      if (sectionEles.length)
        this.createGroupOption(group.value as string, group.label, sectionEles);
    });

    return this.optionsGroups;
  }

  private createGroupOption(sectionId: string, sectionLabel: string, sectionEles: Array<SectionElement>): void {
    const options: Array<OptionKeysModel> = [];
    const section = findSectionById(this.project[RESERVED_AUDS_KEYS._sections], sectionId);
    const indexFirstUserFiield = findFirstUserDefinedField(section.formModel as FormModel);
    sectionEles.forEach(ele => options.push({
      value: `${sectionId}|${ele.id}`,
      label: ele[section.formModel[indexFirstUserFiield].fieldName]
    }));
    this.optionsGroups.push({
      label: sectionLabel,
      options
    });
  }
}