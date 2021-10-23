interface FileSystemHandlePermissionDescriptor {
  writable?: boolean;
}

export interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemCreateWriterOptions {
  keepExistingData?: boolean;
}

export interface FileSystemFileHandle extends FileSystemHandle {
  getFile(): Promise<File>;
  createWritable(options?: FileSystemCreateWriterOptions): Promise<FileSystemWritableFileStream>;
}

interface FileSystemGetFileOptions {
  create?: boolean;
}

interface FileSystemGetDirectoryOptions {
  create?: boolean;
}

interface FileSystemRemoveOptions {
  recursive?: boolean;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  getFile(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
  getDirectory(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
  // getEntries(): AsyncIterableIterator<FileSystemHandle>;
  getEntries(): any;
  removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
}

type FileSystemWriteChunkType = BufferSource | Blob | string;

interface FileSystemWritableFileStream {
  write(contents: FileSystemWriteChunkType): Promise<undefined>;
  seek(position: number): Promise<undefined>;
  truncate(size: number): Promise<undefined>;
  close(): Promise<void>;
}

type ChooseFileSystemEntriesType = "open-file" | "save-file" | "open-directory";

interface ChooseFileSystemEntriesOptionsAccepts {
  description: string;
  mimeTypes: string[];
  extensions: string[];
}

interface ChooseFileSystemEntriesOptions {
  type?: ChooseFileSystemEntriesType;
  multiple?: boolean;
  accepts?: ChooseFileSystemEntriesOptionsAccepts[];
  excludeAcceptAllOption?: boolean;
}

interface SaveFilePickerOptions {
  types?: Array<{
    name?: string;
    description: string,
    accept: { [key: string]: Array<string> }
  }>
}

interface OpenFilePickerOptions {
  multiple: boolean;
}

export interface WindowFS extends Window {
  chooseFileSystemEntries(options?: ChooseFileSystemEntriesOptions): Promise<FileSystemHandle | FileSystemHandle[]>;
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  showOpenFilePicker(options?: { multiple: false; }): Promise<FileSystemFileHandle>;
  showOpenFilePicker(options?: { multiple: true; }): Promise<Array<FileSystemFileHandle>>;
}

type SystemDirectoryType = "sandbox";

interface GetSystemDirectoryOptions {
  type: SystemDirectoryType;
}

interface FileSystemDirectoryHandleConstructor {
  getSystemDirectory(options: GetSystemDirectoryOptions): Promise<FileSystemDirectoryHandle>;
}

declare var FileSystemDirectoryHandle: FileSystemDirectoryHandleConstructor;