import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { useState } from 'react'

export const useValidators = (fieldId): [boolean, ((isValid: boolean) => void)] => {

  const [isValid, setIsValid] = useState(true)

  const setIsValidForField = (isValid) => {
    setIsValid(isValid)
    storeDispatcher({
      type: REDUX_ACTIONS.setValidStateForEle, payload: {
        formEleId: fieldId,
        valid: isValid
      }
    });
  }

  return [isValid, setIsValidForField];
}