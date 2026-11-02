import { LOCAL_FILE_REMOTE_ID } from 'app/libs/cloud-sync/local-file/local-file.const'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

/** Settings that belong to this device or to other services: never compared, never written in the file. */
const DEVICE_SETTINGS = ['localStorage', 'remoteStorage', 'remoteAccessLevel', 'dropboxFolder'] as const

const MAX_FILE_NAME_LENGTH = 80

/**
 * Name proposed for the file of a new project: its title, made safe for every operating system.
 * @featurePart sync.local-file-projects
 */
export const localFileNameForProject = (title: string | undefined): string => {
  const safeTitle = (title ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, MAX_FILE_NAME_LENGTH)
    .replace(/[\s.]+$/, '')
  return `${safeTitle || 'Anita project'}.json`
}

/**
 * Settings of a project read from its file, as stored on this device: marked as synced with the file, without the
 * options of other services.
 * @internal
 */
export const markAsLocalFileProject = (data: TAnitaUniversalDataStorage): TAnitaUniversalDataStorage => {
  const settings = data[RESERVED_AUDS_KEYS._settings]?.[0]
  if (settings) {
    settings.remoteStorage = LOCAL_FILE_REMOTE_ID
    delete settings.remoteAccessLevel
    delete settings.dropboxFolder
    delete settings.localStorage
  }
  return data
}

/**
 * Content of the file of a project: the project as an export with "Data and Structure", without the settings of this
 * device, so that the file can be imported anywhere.
 * @featurePart sync.local-file-projects
 */
export const localFileContent = (data: TAnitaUniversalDataStorage): string => {
  const copy: TAnitaUniversalDataStorage = { ...data, [RESERVED_AUDS_KEYS._settings]: data[RESERVED_AUDS_KEYS._settings].map(settings => ({ ...settings })) }
  copy[RESERVED_AUDS_KEYS._settings].forEach((settings) => {
    DEVICE_SETTINGS.forEach(key => delete settings[key])
  })
  return JSON.stringify(copy, null, 2)
}

/**
 * JSON with sorted keys and without the settings of this device, to compare records regardless of key order.
 */
const comparable = (record: ISectionElement): string => JSON.stringify(record, (key, val) => {
  if ((DEVICE_SETTINGS as ReadonlyArray<string>).includes(key)) {
    return undefined
  }
  return val && typeof val === 'object' && !Array.isArray(val)
    ? Object.keys(val).sort().reduce<Record<string, unknown>>((sorted, k) => {
        sorted[k] = val[k]; return sorted
      }, {})
    : val
})

const changeDateOf = (record: ISectionElement): string | undefined => record[RESERVED_FIELDS.updatedAt] ?? record[RESERVED_FIELDS.createdAt]

/** @internal */
export interface IManualEditsResult {
  /** Records of the file that were completed or marked as changed: the file must be written again. */
  changed: number
}

/**
 * Changes made to the file by hand (or by another program) do not update the dates that the merge relies on.
 * Before merging, the records of the file are made comparable with those of this device:
 * - records without an id get one, and records without a creation date get the time the file was changed;
 * - records whose content differs from this device's copy, but with the same dates, are marked as changed at the time
 *   the file was changed, so that the most recent version wins as for any other change.
 * Records removed from the file are removed from this device by the merge, as deletions.
 * @featurePart sync.local-file-projects
 */
export const prepareManualEdits = (
  localData: TAnitaUniversalDataStorage,
  fileData: TAnitaUniversalDataStorage,
  fileChangedAt: string,
  newId: () => string,
): IManualEditsResult => {
  let changed = 0
  for (const section of Object.keys(fileData)) {
    const records = fileData[section]
    if (!Array.isArray(records)) {
      continue
    }
    const localById = new Map((localData[section] ?? []).map(record => [record[RESERVED_FIELDS.id], record]))
    records.forEach((record) => {
      if (!record || typeof record !== 'object') {
        return
      }
      if (!record[RESERVED_FIELDS.id]) {
        record[RESERVED_FIELDS.id] = newId()
        changed++
      }
      if (!record[RESERVED_FIELDS.createdAt]) {
        record[RESERVED_FIELDS.createdAt] = fileChangedAt
        changed++
      }
      const local = localById.get(record[RESERVED_FIELDS.id])
      if (local && DateTools.areEqual(changeDateOf(local), changeDateOf(record)) && comparable(local) !== comparable(record)) {
        record[RESERVED_FIELDS.updatedAt] = fileChangedAt
        changed++
      }
    })
  }
  return { changed }
}
