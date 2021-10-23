import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { Store } from '@ngrx/store';

export type NgxDispatch<A> = (payload: A) => void;

export interface StateData<S, A> {
  ngRxStore: Store<ReducerTypes>;
}

/**
 * Prepares a pointer to the ngRx state loaded in memory on a constant accessible outside of Angular services
 * 
 * @remarks in this way it is possible to manipulate the ngRx state anywhere, also in non Angular code
 */
export const stateData: StateData<any, any> = {
  ngRxStore: undefined
};
