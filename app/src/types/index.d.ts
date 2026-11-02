export {}

declare global {
  /** File System Access API: available in Chromium-based desktop browsers only. */
  interface IFilePickerAcceptType {
    description?: string
    accept: Record<string, Array<string>>
  }

  interface IOpenFilePickerOptions {
    multiple?: boolean
    excludeAcceptAllOption?: boolean
    types?: Array<IFilePickerAcceptType>
    id?: string
  }

  interface ISaveFilePickerOptions {
    suggestedName?: string
    excludeAcceptAllOption?: boolean
    types?: Array<IFilePickerAcceptType>
    id?: string
  }

  interface Window {
    showOpenFilePicker?: (options?: IOpenFilePickerOptions) => Promise<Array<FileSystemFileHandle>>
    showSaveFilePicker?: (options?: ISaveFilePickerOptions) => Promise<FileSystemFileHandle>
  }

  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite'
  }

  interface FileSystemHandle {
    queryPermission?: (descriptor?: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>
    requestPermission?: (descriptor?: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>
  }
}
