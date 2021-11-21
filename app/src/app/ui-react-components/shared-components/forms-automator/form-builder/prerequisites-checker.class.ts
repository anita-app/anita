import { Prerequisites } from 'app/data/model/form-model-commons';
import { FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

export class PrerequisitesChecker<ELEMENT extends Partial<SupportedFormsTypes>> {

  private isIntegrated = false;

  constructor(
    private formEle: FormFieldsModel<Partial<SupportedFormsTypes>>,
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
      // We use a relaxed equality check here, because the value can be a string or a number
      // eslint-disable-next-line eqeqeq
      if (this.objValues[key] && (prereq[key].filter(prereqValue => prereqValue == this.objValues[key]).length > 0))
        this.setIsIntegrated();
  }

  private setIsIntegrated(): void {
    this.isIntegrated = true;
  }

}
