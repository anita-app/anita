import { useEffect, useState } from 'react'
import { FormElesValidState } from 'app/state/form-eles-valid-state/form-eles-valid-state.class'

export const useValidators = (fieldId: string): [boolean, ((isValid: boolean) => void)] => {
  const [isValid, setIsValid] = useState(true)

  useEffect(() => () => {
    FormElesValidState.unsetValidStateForEle(fieldId)
  }, [fieldId])

  const setIsValidForField = (isValid: boolean) => {
    setIsValid(isValid)
    FormElesValidState.setValidStateForEle(fieldId, isValid)
  }

  return [isValid, setIsValidForField]
}
