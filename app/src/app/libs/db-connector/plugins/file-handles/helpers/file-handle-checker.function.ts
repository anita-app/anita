import { DsDbInitOptions } from 'app/libs/db-connector/models/executers'
import { FileSystemDirectoryHandle, FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { FsHelper } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper'

/**
 * Uses the fileHandle stored in IndexedDB, if any, or asks for a new one
 */
export async function fileHandleChecker (
  options: DsDbInitOptions,
  description?: string,
  accept?: { [mimeType: string]: Array<string> }
): Promise<FileSystemFileHandle> {
  if (!options.projectInfo.fileHandle) {
    return await FsHelper.getNewFileHandle(`anita-fh-${options.projectInfo.id}`, description, accept)
  }

  await FsHelper.verifyPermission(options.projectInfo.fileHandle, true)
  return options.projectInfo.fileHandle
}

export async function dirHandleChecker (options: DsDbInitOptions): Promise<FileSystemDirectoryHandle> {
  if (!options.projectInfo.fileHandle) {
    return await FsHelper.getDirectoryHandle()
  }

  await FsHelper.verifyPermission(options.projectInfo.fileHandle, true)
  return options.projectInfo.fileHandle as any as FileSystemDirectoryHandle
}
