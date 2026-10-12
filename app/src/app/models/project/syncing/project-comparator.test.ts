import { Comparator } from 'app/models/project/syncing/project-comparator'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

const LAST_SYNC = '2026-05-10T10:00:00.000Z'
const BEFORE = '2026-05-10T09:00:00.000Z'
const AFTER = '2026-05-10T11:00:00.000Z'
const LATER = '2026-05-10T12:00:00.000Z'

const element = (id: string, createdAt: string, updatedAt?: string, extra: Partial<ISectionElement> = {}): ISectionElement => ({
  id,
  createdAt,
  ...(updatedAt ? { updatedAt } : {}),
  ...extra,
})

const project = (records: Array<ISectionElement>, settingsUpdatedAt = BEFORE): TAnitaUniversalDataStorage => ({
  _settings: [{ id: 'p1', title: 'P', description: '', createdAt: BEFORE, updatedAt: settingsUpdatedAt }],
  _sections: [{ id: 's1', title: 'S', formModel: [], createdAt: BEFORE } as any],
  s1: records,
})

const compare = (lastSync: string | undefined, local: TAnitaUniversalDataStorage, remote: TAnitaUniversalDataStorage) => (
  new Comparator(lastSync, JSON.parse(JSON.stringify(local)), JSON.parse(JSON.stringify(remote))).compare()
)

describe('Comparator', () => {
  it('imports remote records on the first sync', () => {
    const result = compare(undefined, project([]), project([element('e1', BEFORE)]))
    expect(result.local.insert.s1?.map(e => e.id)).toEqual(['e1'])
    expect(result.remote.delete.s1).toBeUndefined()
  })

  it('uploads local records on the first sync', () => {
    const result = compare(undefined, project([element('e1', BEFORE)]), project([]))
    expect(result.remote.insert.s1?.map(e => e.id)).toEqual(['e1'])
    expect(result.local.delete.s1).toBeUndefined()
  })

  it('adds records created remotely after the last sync', () => {
    const result = compare(LAST_SYNC, project([]), project([element('e1', AFTER)]))
    expect(result.local.insert.s1?.map(e => e.id)).toEqual(['e1'])
  })

  it('deletes remotely the records deleted on this device', () => {
    const result = compare(LAST_SYNC, project([]), project([element('e1', BEFORE)]))
    expect(result.remote.delete.s1?.map(e => e.id)).toEqual(['e1'])
    expect(result.local.insert.s1).toBeUndefined()
  })

  it('uploads records created on this device after the last sync', () => {
    const result = compare(LAST_SYNC, project([element('e1', AFTER)]), project([]))
    expect(result.remote.insert.s1?.map(e => e.id)).toEqual(['e1'])
  })

  it('deletes on this device the records deleted remotely', () => {
    const result = compare(LAST_SYNC, project([element('e1', BEFORE)]), project([]))
    expect(result.local.delete.s1?.map(e => e.id)).toEqual(['e1'])
    expect(result.remote.insert.s1).toBeUndefined()
  })

  it('keeps the most recent version of a record changed on both sides', () => {
    const local = project([element('e1', BEFORE, AFTER, { title: 'local' } as any)])
    const remote = project([element('e1', BEFORE, LATER, { title: 'remote' } as any)])
    const result = compare(LAST_SYNC, local, remote)
    expect(result.local.update.s1?.map(e => (e as any).title)).toEqual(['remote'])
    expect(result.remote.update.s1).toBeUndefined()
  })

  it('sends newer local records to the remote', () => {
    const local = project([element('e1', BEFORE, LATER)])
    const remote = project([element('e1', BEFORE, AFTER)])
    const result = compare(LAST_SYNC, local, remote)
    expect(result.remote.update.s1?.map(e => e.id)).toEqual(['e1'])
  })

  it('does nothing when both sides are equal', () => {
    const records = [element('e1', BEFORE, AFTER)]
    const result = compare(LAST_SYNC, project(records), project(records))
    expect(result.local).toEqual({ delete: {}, insert: {}, update: {} })
    expect(result.remote).toEqual({ delete: {}, insert: {}, update: {} })
  })

  it('never deletes settings or sections', () => {
    const local = project([])
    const remote = project([])
    remote._sections.push({ id: 's2', title: 'Old', formModel: [], createdAt: BEFORE } as any)
    const result = compare(LAST_SYNC, local, remote)
    expect(result.remote.delete._sections).toBeUndefined()
  })

  it('applies newer remote settings locally', () => {
    const result = compare(LAST_SYNC, project([], AFTER), project([], LATER))
    expect(result.local.update._settings?.[0].updatedAt).toBe(LATER)
    expect(result.localData._settings[0].updatedAt).toBe(LATER)
  })
})
