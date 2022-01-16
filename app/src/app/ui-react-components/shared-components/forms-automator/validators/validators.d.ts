export type IValidatorsConatinerProps = Pick<ICommonFormEleProps, "formEle" | "element" | "fieldId" | "touched">;

export type IValidatorsProps = IValidatorsConatinerProps & {
  updateValidatorState: (validatorName: SUPPORTED_VALIDATORS, isValid: boolean) => void
};

export type IValidatorsState = {
  [key in SUPPORTED_VALIDATORS]?: boolean;
};