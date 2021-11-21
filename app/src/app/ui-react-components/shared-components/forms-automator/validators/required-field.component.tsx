import { IValidStateForEle } from 'app/libs/redux/action.type';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { IValidatorsConatinerProps } from 'app/ui-react-components/shared-components/forms-automator/validators/validators';
import { useEffect } from 'react';

export const RequiredField = ({ formEle, element, fieldId, touched }: IValidatorsConatinerProps) => {

  const value = element[formEle.fieldName];

  useEffect(() => {
    store.dispatch({
      type: REDUX_ACTIONS.setValidStateForEle, payload: {
        formEleId: `${fieldId}-required`,
        valid: value !== '' && value !== undefined && value !== null
      } as IValidStateForEle
    });
  }, [value, fieldId]);

  if (value || !touched)
    return (<div className="ml-1 text-xs italic text-gray-400">Required</div>);

  return (<div className="ml-1 text-red-600 text-xs italic">This field is required</div>);

};
