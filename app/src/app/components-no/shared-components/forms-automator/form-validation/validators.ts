import { ICommonFormEleProps } from 'app/components-no/shared-components/forms-automator/form-automator.types'
import { SUPPORTED_VALIDATORS } from 'app/components-no/shared-components/forms-automator/form-validation/supported-validators.enum'

export type IValidatorsConatinerProps = Pick<ICommonFormEleProps, 'formEle' | 'element' | 'fieldId' | 'touched'> & {
  setIsValidForField: (isValid: boolean) => void
}

export type IValidatorsProps = Pick<ICommonFormEleProps, 'formEle' | 'element' | 'fieldId' | 'touched'> & {
  updateValidatorState: (validatorName: SUPPORTED_VALIDATORS, isValid: boolean) => void
};

export type IValidatorsState = {
  [key in SUPPORTED_VALIDATORS]?: boolean;
};
