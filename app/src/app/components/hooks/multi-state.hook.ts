import { Dispatch, Reducer, useCallback, useReducer, useRef } from 'react'

export const useMultiState = <T extends Object>(data: T): [T, Dispatch<Partial<T>>, () => T] => {
  const lastState = useRef<T>(data)

  const reducer: Reducer<T, Partial<T>> = (state, action) => {
    const nextState = { ...state, ...action }
    lastState.current = nextState
    return nextState
  }

  const [state, dispatch] = useReducer(reducer, data)
  const getState = useCallback(() => lastState.current, [])

  return [state, dispatch, getState]
}
