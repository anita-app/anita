import { AnitaStore } from 'app/libs/redux/reducers.const'
import { useSelector } from 'react-redux'

export const useValidators = (fieldId): boolean => {
  const validStore = useSelector((store: AnitaStore) => store.formElesValidState[fieldId]);
  const isInValid = validStore === false
  return isInValid;
}