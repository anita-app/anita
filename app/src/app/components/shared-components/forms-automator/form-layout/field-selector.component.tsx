import { formElesSwitcher } from 'app/components/shared-components/forms-automator/form-builder/form-eles-switcher.function'
import { PrerequisitesChecker } from 'app/components/shared-components/forms-automator/form-builder/prerequisites-checker.class'
import { useMemo } from 'react'
import type { FC } from 'react'
import type { ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'

export const FieldSelector: FC<ICommonFormEleProps> = (props: ICommonFormEleProps) => {
  const shouldRender = useMemo(() => new PrerequisitesChecker(
    props.formEle, props.element,
  ).integrates(), [props.formEle, props.element])

  if (shouldRender) {
    return formElesSwitcher(props.formEle.fieldName, props.formEle.componentCode, props)
  }

  return null
}
