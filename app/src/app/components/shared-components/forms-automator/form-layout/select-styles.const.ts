import type { StylesConfig } from 'react-select'

// Same look as FORM_ELEMENTS_CSS_CLASSES (gray-300/400 borders, prussian-blue-500 when focused, red when invalid).
const BORDER = { normal: '#d1d5db', hover: '#9ca3af', focus: '#002346', error: '#fca5a5', errorHover: '#f87171' }

/**
 * Styles of react-select fields, so that they look like the other fields of the form.
 */
export const formSelectStyles = (hasError: boolean): StylesConfig<any, true> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 6,
    borderWidth: hasError ? 2 : 1,
    borderColor: hasError ? BORDER.error : (state.isFocused ? BORDER.focus : BORDER.normal),
    boxShadow: 'none',
    '&:hover': { borderColor: hasError ? BORDER.errorHover : (state.isFocused ? BORDER.focus : BORDER.hover) },
  }),
  multiValue: (base) => ({ ...base, borderRadius: 4 }),
  menu: (base) => ({ ...base, zIndex: 20 }),
})
