import { DROPBOX_PROJECTS_FOLDER, DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import type { IDropboxFileLink, IDropboxProjectFile } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

const MAX_FILE_NAME_LENGTH = 80

/**
 * Path of the file for a new project: its title, made safe for every operating system.
 * Dropbox renames the file if one with the same name exists.
 * @featurePart sync.dropbox-projects
 */
export const dropboxPathForProject = (title: string | undefined, folder: string = DROPBOX_PROJECTS_FOLDER): string => {
  const safeTitle = (title ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, MAX_FILE_NAME_LENGTH)
    .replace(/[\s.]+$/, '')
  return `${folder.replace(/\/+$/, '')}/${safeTitle || 'Anita project'}.json`
}

/**
 * How a folder is shown to users: "Dropbox" for the root, otherwise its path.
 * The root is '' for the Dropbox API, and '/' where an empty value means "the Anita folder" (`dropboxFolder`).
 * @internal
 */
export const displayDropboxFolder = (folder: string): string => (folder && folder !== '/' ? folder : 'Dropbox')

/**
 * The folder that contains a file or folder ('' for the root).
 * @internal
 */
export const parentDropboxFolder = (path: string): string => path.replace(/\/[^/]*$/, '')

/**
 * Reads the content of a file: returns the project, or null if the file is not an Anita project.
 * @featurePart sync.dropbox-open-file
 */
export const parseProjectFile = (content: string): TAnitaUniversalDataStorage | null => {
  try {
    const data = JSON.parse(content)
    const settings = data?.[RESERVED_AUDS_KEYS._settings]
    if (!Array.isArray(settings) || typeof settings[0]?.id !== 'string' || !settings[0].id || !Array.isArray(data[RESERVED_AUDS_KEYS._sections])) {
      return null
    }
    return data as TAnitaUniversalDataStorage
  } catch {
    return null
  }
}

/**
 * Settings of a project as stored in Dropbox and on this device: always marked as synced with Dropbox,
 * also for files created by older versions of the app, and without the options of WordPress or of the first upload.
 * @internal
 */
export const markAsDropboxProject = (data: TAnitaUniversalDataStorage): TAnitaUniversalDataStorage => {
  const settings = data[RESERVED_AUDS_KEYS._settings]?.[0]
  if (settings) {
    settings.remoteStorage = DROPBOX_REMOTE_ID
    delete settings.remoteAccessLevel
    delete settings.dropboxFolder
  }
  return data
}

interface ILocalProjectForPlan {
  id: string
  remoteStorage?: string
}

/** @internal */
export interface IDropboxSyncPlan {
  /** Projects in the Dropbox folder that are not on this device. */
  toImport: Array<IDropboxProjectFile>
  /** Projects to sync with Dropbox, not linked to a file yet, whose file is already in the folder. */
  toLink: Array<{ projectId: string; file: IDropboxProjectFile }>
  /** Projects to sync with Dropbox that have no file yet. */
  toUpload: Array<string>
  /** Projects linked to a file that is no longer in Dropbox. */
  missing: Array<string>
  /** Links of projects that are no longer synced with Dropbox. */
  staleLinks: Array<string>
}

/**
 * Decides what the account-level sync does, from the files of the Dropbox folder, the projects on this device
 * and their links. `missingFileIds` are linked files that Dropbox reported as deleted.
 * @featurePart sync.dropbox-projects, sync.dropbox-missing-file
 */
export const planDropboxSync = (
  files: Array<IDropboxProjectFile>,
  localProjects: Array<ILocalProjectForPlan>,
  links: Record<string, IDropboxFileLink>,
  missingFileIds: Set<string>,
): IDropboxSyncPlan => {
  const plan: IDropboxSyncPlan = { toImport: [], toLink: [], toUpload: [], missing: [], staleLinks: [] }
  const localById = new Map(localProjects.map(project => [project.id, project]))
  const linkedFileIds = new Set(Object.values(links).map(link => link.fileId))
  const firstFileOfProject = new Map<string, IDropboxProjectFile>()
  files.forEach((file) => {
    if (file.projectId && !firstFileOfProject.has(file.projectId)) {
      firstFileOfProject.set(file.projectId, file)
    }
  })

  firstFileOfProject.forEach((file, projectId) => {
    // A local copy that is not synced with Dropbox, or synced with another file, keeps its own sync data.
    if (!localById.has(projectId) && !linkedFileIds.has(file.fileId)) {
      plan.toImport.push(file)
    }
  })

  localProjects.forEach((project) => {
    const link = links[project.id]
    if (project.remoteStorage !== DROPBOX_REMOTE_ID) {
      if (link) {
        plan.staleLinks.push(project.id)
      }
      return
    }
    if (link) {
      if (missingFileIds.has(link.fileId)) {
        plan.missing.push(project.id)
      }
      return
    }
    const file = firstFileOfProject.get(project.id)
    if (file && !linkedFileIds.has(file.fileId)) {
      plan.toLink.push({ projectId: project.id, file })
    } else {
      plan.toUpload.push(project.id)
    }
  })

  Object.keys(links).forEach((projectId) => {
    if (!localById.has(projectId)) {
      plan.staleLinks.push(projectId)
    }
  })

  return plan
}
