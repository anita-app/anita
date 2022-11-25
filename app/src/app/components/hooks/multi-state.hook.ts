import { Dispatch, useCallback, useReducer, useRef } from 'react'

export const useMultiState = <T extends Object>(data: T): [T, Dispatch<Partial<T>>, () => T] => {
  const lastState = useRef(data)
  const getState = useCallback(() => lastState.current, [])
  return [
    ...useReducer<(state: T, action: Partial<T>) => T>
      (
      // eslint-disable-next-line no-return-assign
      (state, action) => lastState.current = ({ ...state, ...action }),
      data
      ),
    getState
  ]
}
