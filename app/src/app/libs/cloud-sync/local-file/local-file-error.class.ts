/** @internal */
export enum LocalFileErrorCode {
  /** The browser does not support files on this computer. */
  unsupported = 'unsupported',
  /** The user has not allowed Anita to read and write the file in this visit. */
  permissionNeeded = 'permission_needed',
  /** The file was moved or renamed or deleted. */
  notFound = 'not_found',
  /** The file is not valid JSON or not an Anita project. */
  invalidFile = 'invalid_file',
  /** The file contains another project. */
  otherProject = 'other_project',
  /** The file was changed outside Anita while syncing. */
  conflict = 'conflict',
  unknown = 'unknown',
}

/** @internal */
export class LocalFileSyncError extends Error {
  constructor (
    public code: LocalFileErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'LocalFileSyncError'
  }

  public static from (error: unknown): LocalFileSyncError {
    if (error instanceof LocalFileSyncError) {
      return error
    }
    const name = (error as { name?: string } | undefined)?.name
    const message = (error as { message?: string } | undefined)?.message ?? String(error)
    if (name === 'NotFoundError') {
      return new LocalFileSyncError(LocalFileErrorCode.notFound, message)
    }
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return new LocalFileSyncError(LocalFileErrorCode.permissionNeeded, message)
    }
    if (name === 'InvalidStateError' || name === 'NoModificationAllowedError') {
      return new LocalFileSyncError(LocalFileErrorCode.conflict, message)
    }
    return new LocalFileSyncError(LocalFileErrorCode.unknown, message)
  }
}

/**
 * Message shown to the user for a failed sync with a file on this computer.
 * @featurePart sync.local-file-projects
 */
export const getLocalFileErrorMessage = (error: unknown, fileName = 'the file'): string => {
  const syncError = LocalFileSyncError.from(error)
  switch (syncError.code) {
    case LocalFileErrorCode.unsupported:
      return 'This browser cannot use files on your computer. Open Anita in Chrome, Edge or another Chromium-based browser on a computer. Your changes are kept in this browser.'
    case LocalFileErrorCode.permissionNeeded:
      return `Anita needs your permission to open ${fileName}. Your changes are kept in this browser and will be saved in the file once you allow it.`
    case LocalFileErrorCode.notFound:
      return `${fileName} was not found: it may have been moved, renamed or deleted. Choose the file again, or save the project in a new file. Your changes are kept in this browser.`
    case LocalFileErrorCode.invalidFile:
      return `${fileName} cannot be read: it is not valid JSON or not an Anita project, maybe because of a manual edit, or it is in a cloud folder and not available offline. Fix or download the file, or save the project in a new file. The file is not overwritten, and your changes are kept in this browser.`
    case LocalFileErrorCode.otherProject:
      return `${fileName} contains another project. Choose the file of this project, or save it in a new file.`
    case LocalFileErrorCode.conflict:
      return `${fileName} was changed by another program while Anita was saving it. Anita will try again at the next sync.`
    default:
      return `${fileName} could not be synced: ${syncError.message}`
  }
}
