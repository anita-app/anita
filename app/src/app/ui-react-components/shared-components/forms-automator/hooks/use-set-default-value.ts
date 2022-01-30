import { SectionElement } from 'app/data/project-structure/project-info'
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { useEffect } from 'react'

export const useSetDefaultValue = <T extends string | number>(element: SectionElement, defaultValue: T, fieldName: string | number, valueSetter: (fieldName: string | number, value: T) => void) => {
  useEffect(() => {
    if (!element[RESERVED_FIELDS.id] && !element[fieldName] && defaultValue) {
      valueSetter(fieldName, defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}