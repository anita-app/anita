import { displayDropboxFolder, dropboxPathForProject, markAsDropboxProject, parseProjectFile, planDropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-files.function'
import { DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import type { IDropboxFileLink, IDropboxProjectFile } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

const file = (fileId: string, projectId: string | null): IDropboxProjectFile => ({ fileId, projectId, path: `/Anita/${fileId}.json`, name: `${fileId}.json`, rev: 'r1' })
const link = (projectId: string, fileId: string): IDropboxFileLink => ({ projectId, fileId })
const linksOf = (...items: Array<IDropboxFileLink>): Record<string, IDropboxFileLink> => Object.fromEntries(items.map(item => [item.projectId, item]))

describe('dropboxPathForProject', () => {
  it('saves the project in the Anita folder, named after its title', () => {
    expect(dropboxPathForProject('My tasks')).toBe('/Anita/My tasks.json')
  })

  it('removes characters that some systems do not accept', () => {
    expect(dropboxPathForProject('Clients: 2026/Q1 <draft>?')).toBe('/Anita/Clients 2026 Q1 draft.json')
  })

  it('uses a default name for empty titles', () => {
    expect(dropboxPathForProject('  ')).toBe('/Anita/Anita project.json')
    expect(dropboxPathForProject(undefined)).toBe('/Anita/Anita project.json')
  })

  it('does not end the name with dots or spaces', () => {
    expect(dropboxPathForProject('Notes...')).toBe('/Anita/Notes.json')
  })

  it('saves in the folder chosen by the user, also the root of Dropbox', () => {
    expect(dropboxPathForProject('Clients', '/Work/2026')).toBe('/Work/2026/Clients.json')
    expect(dropboxPathForProject('Clients', '/')).toBe('/Clients.json')
  })
})

describe('displayDropboxFolder', () => {
  it('names the root of Dropbox', () => {
    expect(displayDropboxFolder('')).toBe('Dropbox')
    expect(displayDropboxFolder('/')).toBe('Dropbox')
    expect(displayDropboxFolder('/Work')).toBe('/Work')
  })
})

describe('parseProjectFile', () => {
  it('reads an Anita project', () => {
    const content = JSON.stringify({ _settings: [{ id: 'p1', title: 'P' }], _sections: [] })
    expect(parseProjectFile(content)?._settings[0].id).toBe('p1')
  })

  it('returns null for other JSON files and for invalid JSON', () => {
    expect(parseProjectFile(JSON.stringify({ name: 'package' }))).toBeNull()
    expect(parseProjectFile(JSON.stringify({ _settings: [{}], _sections: [] }))).toBeNull()
    expect(parseProjectFile('{ not json')).toBeNull()
  })
})

describe('markAsDropboxProject', () => {
  it('marks the settings and drops the WordPress access level and the folder of the first upload', () => {
    const data = { _settings: [{ id: 'p1', remoteStorage: 'example.com', remoteAccessLevel: 'editor', dropboxFolder: '/Work' }], _sections: [] } as unknown as TAnitaUniversalDataStorage
    markAsDropboxProject(data)
    expect(data._settings[0].remoteStorage).toBe(DROPBOX_REMOTE_ID)
    expect(data._settings[0].remoteAccessLevel).toBeUndefined()
    expect(data._settings[0].dropboxFolder).toBeUndefined()
  })
})

describe('planDropboxSync', () => {
  it('imports projects of the folder that are not on this device', () => {
    const plan = planDropboxSync([file('f1', 'p1'), file('f2', null)], [], {}, new Set())
    expect(plan.toImport.map(item => item.fileId)).toEqual(['f1'])
  })

  it('does not import a project twice when the folder has two copies of it', () => {
    const plan = planDropboxSync([file('f1', 'p1'), file('f2', 'p1')], [], {}, new Set())
    expect(plan.toImport.map(item => item.fileId)).toEqual(['f1'])
  })

  it('does not import again the files of projects deleted only from this device', () => {
    const plan = planDropboxSync([file('f1', 'p1'), file('f2', 'p2')], [], {}, new Set(), new Set(['f1']))
    expect(plan.toImport.map(item => item.fileId)).toEqual(['f2'])
  })

  it('leaves alone local projects that are not synced with Dropbox', () => {
    const plan = planDropboxSync([file('f1', 'p1')], [{ id: 'p1' }, { id: 'p2', remoteStorage: 'example.com' }], {}, new Set())
    expect(plan).toEqual({ toImport: [], toLink: [], toUpload: [], missing: [], staleLinks: [] })
  })

  it('links a project to sync to the file that already contains it', () => {
    const plan = planDropboxSync([file('f1', 'p1')], [{ id: 'p1', remoteStorage: DROPBOX_REMOTE_ID }], {}, new Set())
    expect(plan.toLink).toEqual([{ projectId: 'p1', file: file('f1', 'p1') }])
    expect(plan.toUpload).toEqual([])
  })

  it('uploads projects to sync that have no file', () => {
    const plan = planDropboxSync([], [{ id: 'p1', remoteStorage: DROPBOX_REMOTE_ID }], {}, new Set())
    expect(plan.toUpload).toEqual(['p1'])
  })

  it('does nothing for linked projects whose file exists, also outside the folder', () => {
    const plan = planDropboxSync([file('f1', 'p1')], [{ id: 'p1', remoteStorage: DROPBOX_REMOTE_ID }, { id: 'p2', remoteStorage: DROPBOX_REMOTE_ID }], linksOf(link('p1', 'f1'), link('p2', 'elsewhere')), new Set())
    expect(plan).toEqual({ toImport: [], toLink: [], toUpload: [], missing: [], staleLinks: [] })
  })

  it('reports linked projects whose file was deleted', () => {
    const plan = planDropboxSync([], [{ id: 'p1', remoteStorage: DROPBOX_REMOTE_ID }], linksOf(link('p1', 'f1')), new Set(['f1']))
    expect(plan.missing).toEqual(['p1'])
    expect(plan.toUpload).toEqual([])
  })

  it('forgets links of projects deleted from this device or no longer synced with Dropbox', () => {
    const plan = planDropboxSync([], [{ id: 'p2', remoteStorage: 'example.com' }], linksOf(link('gone', 'f1'), link('p2', 'f2')), new Set())
    expect(plan.staleLinks.sort()).toEqual(['gone', 'p2'])
  })

  it('does not import a file already linked to another project', () => {
    const plan = planDropboxSync([file('f1', 'p1')], [{ id: 'p9', remoteStorage: DROPBOX_REMOTE_ID }], linksOf(link('p9', 'f1')), new Set())
    expect(plan.toImport).toEqual([])
  })
})
