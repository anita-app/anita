import {
  AsyncValidatorFn,
  FormControl,
  ValidatorFn,
  Validators
  } from '@angular/forms';
import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { SectionCustomFieldProperties, SectionElement } from '@anita/client/data/model/project-info';
import { SectionModel } from '@anita/client/libs/db-connector/db-builder/sez-definition';
import { IdCreator } from '@anita/client/libs/id-creator/id-creator.class';
import { getUTCDateTime } from '@anita/client/libs/tools/tools';
import { CUSTOM_VALIDATORS } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/custom-validators.constant';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

type SupportedValues = string | number | boolean;
interface FormState {
  value: SupportedValues;
  readonly: boolean;
}

export class FormControlMaker<S extends string | number> {

  private section: S;

  constructor(
    private formField: FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>,
    private element: Partial<SectionCustomFieldProperties | SectionElement> = {},
    private sectionModelInDS?: SectionModel<SectionElement>,
    private name?: S
  ) { }

  public make(): FormControl {
    this.section = this.sectionModelInDS && this.sectionModelInDS.name === this.name ? this.name : undefined;
    return (!this.formField.validators) ? new FormControl(this.determineFieldValue()) : this.setFormFieldWithValidators();
  }

  private setFormFieldWithValidators(): FormControl {

    const fieldValue = this.determineFieldValue();

    const formState: SupportedValues | FormState = fieldValue;

    const arrValidators = this.setValidators();
    const arrAsyncValidators = this.setAsyncValidators();

    return new FormControl(formState, arrValidators, arrAsyncValidators);
  }

  private determineFieldValue(): SupportedValues {
    if (this.element[this.formField.fieldName])
      return this.element[this.formField.fieldName];

    if (this.isThePrimaryKey())
      return this.callIdCreator();

    if (this.isACheckBox())
      return (this.isASectionFieldDefinition(this.element) && (this.element['validators'].required || this.element['validators'].requiredTrue)) ? true : false;

    if (this.isDateCreationField(this.formField))
      return getUTCDateTime();

    if (typeof this.formField.value === 'function')
      return this.formField.value();

    return this.formField.value;
  }

  private isThePrimaryKey(): boolean {
    return this.section && this.formField.fieldName === this.sectionModelInDS.pk;
  }

  private isACheckBox(): boolean {
    return this.formField.componentCode && this.formField.componentCode === FORM_COMPONENTS_CODES.basicCheckbox;
  }

  private isASectionFieldDefinition(arg: Partial<SectionCustomFieldProperties | SectionElement>): arg is SectionCustomFieldProperties {
    return (arg as SectionCustomFieldProperties).validators !== undefined;
  }

  private isDateCreationField(formField: Partial<SectionCustomFieldProperties | SectionElement>): boolean {
    return formField.fieldName === RESERVED_FIELDS.dateCreation;
  }

  private callIdCreator(): string {
    return IdCreator.make(this.sectionModelInDS.name);
  }

  private setValidators(): Array<ValidatorFn> {
    const arrValidators: Array<ValidatorFn> = [];

    if (this.formField.validators.requiredTrue)
      arrValidators.push(Validators.requiredTrue);
    if (this.formField.validators.required)
      arrValidators.push(Validators.required);
    if (this.formField.validators.minLength)
      arrValidators.push(Validators.minLength(this.formField.validators.minLength));
    if (this.formField.validators.email)
      arrValidators.push(Validators.email);

    for (const validator in CUSTOM_VALIDATORS.sync)
      if (this.formField.validators[validator])
        arrValidators.push(CUSTOM_VALIDATORS.sync[validator] as any);

    return (arrValidators.length) ? arrValidators : undefined;
  }

  private setAsyncValidators(): Array<AsyncValidatorFn> {
    const arrAsyncValidators: Array<AsyncValidatorFn> = [];

    for (const validator in CUSTOM_VALIDATORS.async)
      if (this.formField.validators[validator])
        arrAsyncValidators.push(CUSTOM_VALIDATORS.async[validator] as any);

    return (arrAsyncValidators.length) ? arrAsyncValidators : undefined;
  }

}
