import { formElesSwitcher } from 'app/ui-react-components/shared-components/forms-automator/form-builder/form-eles-switcher.function';
import { PrerequisitesChecker } from 'app/ui-react-components/shared-components/forms-automator/form-builder/prerequisites-checker.class';
import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { useMemo } from 'react';

export const FieldSelector = (props: ICommonFormEleProps) => {

  const shouldRender = useMemo(() => new PrerequisitesChecker(props.formEle, props.element).integrates(), [props.formEle, props.element]);

  if (shouldRender)
    return formElesSwitcher(props.formEle.fieldName, props.formEle.componentCode, props);

  return null;

}