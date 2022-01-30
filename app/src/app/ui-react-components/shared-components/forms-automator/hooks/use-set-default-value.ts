import { useEffect } from 'react'

export const useSetDefaultValue = <T extends string | number>(currentValue: T, defaultValue: T, fieldName: string | number, valueSetter: (fieldName: string | number, value: T) => void) => {
  useEffect(() => {
    if (!currentValue && defaultValue) {
      valueSetter(fieldName, defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, defaultValue, fieldName])
}


/*
export const useSetDefaultValue = <T extends string | number>(element: SectionElement, formEle: IBasicSelect<SectionElement>, defaultValue: T, fieldName: string | number, valueSetter: (fieldName: string | number, value: T) => void) => {
  const isFirstCheckOfDefaultValue = useRef(true)
  const previousePrerequisitesValues = useRef<Array<string | number>>(null)
  const valuesToCheck = [];
  if (formEle?.prerequisites?.length) {
    const propsToCheck = formEle?.prerequisites.map(prerequisite => Object.keys(prerequisite)).flat().filter((value, index, array) => array.indexOf(value) === index);
    propsToCheck.forEach(prop => {
      if (element.hasOwnProperty(prop)) {
        valuesToCheck.push(element[prop])
      }
    })
    if (isFirstCheckOfDefaultValue.current) {
      previousePrerequisitesValues.current = valuesToCheck
    }
  }

  // Sets or resets the default value at the first load or any time a prerequisite changes, if a default value exists
  useEffect(() => {
    isFirstCheckOfDefaultValue.current = false
    if (
      !element[RESERVED_FIELDS.id] &&
      defaultValue &&
      (!element[fieldName] || (
        !isFirstCheckOfDefaultValue.current &&
        formEle?.prerequisites?.length &&
        !previousePrerequisitesValues.current.every((value, index) => value === valuesToCheck[index])
      ))) {
      console.log('vado')
      valueSetter(fieldName, defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })
}
*/