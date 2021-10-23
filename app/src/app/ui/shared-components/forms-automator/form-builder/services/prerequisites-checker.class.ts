import { Prerequisites } from '@anita/client/data/model/form-model-commons';
import { SectionCustomFieldProperties, SectionElement } from '@anita/client/data/model/project-info';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export class PrerequisitesChecker<ELEMENT extends Partial<SectionCustomFieldProperties | SectionElement>> {

  private isIntegrated = false;

  constructor(
    private formEle: FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>,
    private objValues: Partial<ELEMENT>
  ) { }

  public integrates(): boolean {
    if (!this.formEle.prerequisites || !this.formEle.prerequisites.length)
      return true;

    this.loopPrerequisites();

    return this.isIntegrated;
  }

  private loopPrerequisites(): void {
    let counter = 0;
    while (this.isIntegrated === false && counter < this.formEle.prerequisites.length) {
      this.checkPrerequisites(this.formEle.prerequisites[counter]);
      counter++;
    }
  }

  private checkPrerequisites(prereq: Prerequisites): void {
    for (const key in prereq)
      if (this.objValues[key] && prereq[key].includes(this.objValues[key]))
        this.setIsIntegrated();
  }

  private setIsIntegrated(): void {
    this.isIntegrated = true;
  }

}
