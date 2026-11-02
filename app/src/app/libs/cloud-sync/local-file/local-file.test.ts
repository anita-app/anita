import { localFileContent, localFileNameForProject, markAsLocalFileProject, prepareManualEdits } from 'app/libs/cloud-sync/local-file/local-file.function'
import { LOCAL_FILE_REMOTE_ID } from 'app/libs/cloud-sync/local-file/local-file.const'
import { Comparator } from 'app/models/project/syncing/project-comparator'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

const T0 = '2026-10-01T10:00:00.000Z'
const LAST_SYNC = '2026-10-02T10:00:00.000Z'
const FILE_CHANGED = '2026-10-03T10:00:00.000Z'

const project = (records: Array<Record<string, unknown>>, settings: Record<string, unknown> = {}): TAnitaUniversalDataStorage => ({
  _settings: [{ id: 'p1', title: 'Tasks', description: '', createdAt: T0, ...settings }],
  _sections: [{ id: 's1', title: 'Tasks', createdAt: T0, formModel: [] } as never],
  s1: records as never,
})

let ids = 0
const newId = () => `new-${++ids}`

describe('localFileNameForProject', () => {
  it('names the file after the project, safe for every system', () => {
    expect(localFileNameForProject('Clients: 2026/Q1')).toBe('Clients 2026 Q1.json')
    expect(localFileNameForProject('  ')).toBe('Anita project.json')
  })
})

describe('markAsLocalFileProject and localFileContent', () => {
  it('marks the project read from the file as synced with it', () => {
    const data = markAsLocalFileProject(project([], { remoteStorage: 'dropbox', dropboxFolder: '/x', remoteAccessLevel: 'private' }))
    expect(data._settings[0].remoteStorage).toBe(LOCAL_FILE_REMOTE_ID)
    expect(data._settings[0].dropboxFolder).toBeUndefined()
    expect(data._settings[0].remoteAccessLevel).toBeUndefined()
  })

  it('writes the file without the settings of this device, leaving the data untouched', () => {
    const data = project([{ id: 'r1', createdAt: T0 }], { remoteStorage: LOCAL_FILE_REMOTE_ID, localStorage: 'IndexedDB' })
    const written = JSON.parse(localFileContent(data))
    expect(written._settings[0].remoteStorage).toBeUndefined()
    expect(written._settings[0].localStorage).toBeUndefined()
    expect(written.s1).toEqual([{ id: 'r1', createdAt: T0 }])
    expect(data._settings[0].remoteStorage).toBe(LOCAL_FILE_REMOTE_ID)
  })
})

describe('prepareManualEdits', () => {
  it('marks a record edited by hand, with unchanged dates, as changed when the file was saved', () => {
    const local = project([{ id: 'r1', createdAt: T0, name: 'Old' }])
    const file = project([{ id: 'r1', createdAt: T0, name: 'Edited by hand' }])
    expect(prepareManualEdits(local, file, FILE_CHANGED, newId).changed).toBe(1)
    expect(file.s1[0].updatedAt).toBe(FILE_CHANGED)

    // The merge then keeps the version of the file.
    const result = new Comparator(LAST_SYNC, local, file).compare()
    expect(result.local.update.s1?.[0].name).toBe('Edited by hand')
  })

  it('keeps a change made in Anita after the file was edited', () => {
    const local = project([{ id: 'r1', createdAt: T0, updatedAt: '2026-10-04T10:00:00.000Z', name: 'Changed in Anita' }])
    const file = project([{ id: 'r1', createdAt: T0, name: 'Edited by hand' }])
    prepareManualEdits(local, file, FILE_CHANGED, newId)
    const result = new Comparator(LAST_SYNC, local, file).compare()
    expect(result.remote.update.s1?.[0].name).toBe('Changed in Anita')
  })

  it('completes records added by hand, which are then added to the project', () => {
    const local = project([])
    const file = project([{ name: 'Added by hand' }])
    expect(prepareManualEdits(local, file, FILE_CHANGED, newId).changed).toBe(2)
    expect(file.s1[0].id).toMatch(/^new-/)
    expect(file.s1[0].createdAt).toBe(FILE_CHANGED)
    const result = new Comparator(LAST_SYNC, local, file).compare()
    expect(result.local.insert.s1?.[0].name).toBe('Added by hand')
  })

  it('ignores identical records and the settings of this device', () => {
    const local = project([{ id: 'r1', createdAt: T0, name: 'Same' }], { remoteStorage: LOCAL_FILE_REMOTE_ID })
    const file = project([{ name: 'Same', createdAt: T0, id: 'r1' }])
    expect(prepareManualEdits(local, file, FILE_CHANGED, newId).changed).toBe(0)
  })

  it('lets records removed by hand be deleted from the project', () => {
    const local = project([{ id: 'r1', createdAt: T0, name: 'Removed from the file' }])
    const file = project([])
    prepareManualEdits(local, file, FILE_CHANGED, newId)
    const result = new Comparator(LAST_SYNC, local, file).compare()
    expect(result.local.delete.s1?.[0].id).toBe('r1')
  })
})
