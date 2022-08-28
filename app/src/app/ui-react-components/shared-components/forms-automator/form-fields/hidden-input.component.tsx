import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import React, { memo } from 'react'

export const HiddenInput: React.FC<ICommonFormEleProps> = memo(function HiddenInput ({ formEle, element, handleChange }: ICommonFormEleProps) {
  if (element[formEle.fieldName] === undefined || element[formEle.fieldName] === null) {
    element[formEle.fieldName] = ''
  }

  return (<input
    key={formEle.fieldName}
    name={formEle.fieldName}
    type="hidden"
    value={element[formEle.fieldName]}
    onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(formEle.fieldName, event.target.value)}
          />)
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
