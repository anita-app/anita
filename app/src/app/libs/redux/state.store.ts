import { REDUCERS } from 'app/libs/redux/reducers.const';
import { combineReducers, createStore } from 'redux';

const combinedReducers = combineReducers(REDUCERS)

export const store = createStore(combinedReducers);