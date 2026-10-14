import type { StylesConfig } from 'react-select'

// Same look as FORM_ELEMENTS_CSS_CLASSES (see ui-input in ui.css): soft blue ring when focused, red when invalid.
const BORDER = { normal: '#dbe2ec', hover: '#c3d0e0', focus: '#2d96ff', error: '#f87171', errorHover: '#ef4444' }
const FOCUS_RING = { normal: '0 0 0 4px rgba(45, 150, 255, 0.16)', error: '0 0 0 4px rgba(239, 68, 68, 0.15)' }

/**
 * Styles of react-select fields, so that they look like the other fields of the form.
 */
export const formSelectStyles = (hasError: boolean): StylesConfig<any, true> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hasError ? BORDER.error : (state.isFocused ? BORDER.focus : BORDER.normal),
    boxShadow: state.isFocused ? (hasError ? FOCUS_RING.error : FOCUS_RING.normal) : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': { borderColor: hasError ? BORDER.errorHover : (state.isFocused ? BORDER.focus : BORDER.hover) },
  }),
  multiValue: (base) => ({ ...base, borderRadius: 7, backgroundColor: '#eef4fc' }),
  multiValueLabel: (base) => ({ ...base, color: '#0b3a6e', fontWeight: 600 }),
  multiValueRemove: (base) => ({ ...base, borderRadius: 7, color: '#6b88ab', ':hover': { backgroundColor: '#dbe8f8', color: '#0b3a6e' } }),
  menu: (base) => ({ ...base, zIndex: 20, borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 48px -16px rgba(0, 35, 70, 0.35)', border: '1px solid rgba(0, 35, 70, 0.08)' }),
})
