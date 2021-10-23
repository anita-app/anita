import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';

interface CustomValidators {
  sync: {
    [index: string]: ValidatorFn
  };
  async: {
    [index: string]: AsyncValidatorFn
  };
}

export const CUSTOM_VALIDATORS: CustomValidators = {
  sync: {},
  async: {}
};
