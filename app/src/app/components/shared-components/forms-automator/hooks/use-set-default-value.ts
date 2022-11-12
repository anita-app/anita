import { useEffect } from 'react'

export const useSetDefaultValue = <T extends string | number>(currentValue: T, defaultValue: T, fieldName: string | number, valueSetter: (fieldName: string | number, value: T) => void) => {
  useEffect(() => {
    if (!currentValue && defaultValue) {
      valueSetter(fieldName, defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, defaultValue, fieldName])
}
