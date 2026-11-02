import { getRecordTitle, getTitleField, getTitleFieldOrFirst, withTitleFieldFirst } from 'app/models/section/title-field.function'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'

const field = (fieldName: string, componentCode: number, extra: Record<string, unknown> = {}) => ({ fieldName, label: fieldName, componentCode, ...extra }) as unknown as FormFieldsModel<TSupportedFormsTypes>

describe('getTitleField', () => {
  it('takes the first field when it is a short text', () => {
    expect(getTitleField([field('name', 1, { type: 'text' }), field('notes', 2)])?.fieldName).toBe('name')
  })

  it('skips hidden and reserved fields', () => {
    expect(getTitleField([field('id', 6), field('name', 1)])?.fieldName).toBe('name')
  })

  it('falls back to the first required short text', () => {
    expect(getTitleField([field('done', 3), field('email', 1, { type: 'email', required: true }), field('notes', 1), field('task', 1, { required: true })])?.fieldName).toBe('task')
  })

  it('finds nothing when no short text names the record', () => {
    expect(getTitleField([field('date', 8), field('email', 1, { type: 'email' }), field('notes', 1)])).toBeUndefined()
  })
})

describe('getRecordTitle', () => {
  const formModel = [field('name', 1), field('notes', 2)]

  it('returns the value of the title field', () => {
    expect(getRecordTitle(formModel, { name: ' New company website ' })).toEqual({ title: 'New company website', fieldName: 'name' })
  })

  it('returns nothing for an empty title', () => {
    expect(getRecordTitle(formModel, { name: '' })).toBeUndefined()
    expect(getRecordTitle(formModel, null)).toBeUndefined()
  })
})

describe('withTitleFieldFirst', () => {
  it('moves the title field to the first column', () => {
    const formModel = [field('done', 3), field('due', 8), field('task', 1, { required: true })]
    expect(withTitleFieldFirst(formModel, formModel).map(column => column.fieldName)).toEqual(['task', 'done', 'due'])
  })

  it('keeps the columns when there is no title field or it is hidden', () => {
    const formModel = [field('date', 8), field('task', 1, { required: true })]
    expect(withTitleFieldFirst([formModel[0]], formModel).map(column => column.fieldName)).toEqual(['date'])
    const noTitle = [field('date', 8), field('notes', 2)]
    expect(withTitleFieldFirst(noTitle, noTitle)).toBe(noTitle)
  })
})

describe('getTitleFieldOrFirst', () => {
  it('falls back to the first field', () => {
    expect(getTitleFieldOrFirst([field('id', 6), field('date', 8), field('notes', 2)])?.fieldName).toBe('date')
  })
})
