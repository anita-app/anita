import {
  FileSystemDirectoryHandle,
  FileSystemFileHandle,
  FileSystemWriteChunkType,
  WindowFS
  } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';

declare const window: WindowFS;

/**
 * Open a handle to an existing file on the local file system.
 */
export function getFileHandle(): Promise<Array<FileSystemFileHandle>> {
  return window.showOpenFilePicker({ multiple: false });
}

/**
 * Open a handle to an existing file on the local file system.
 */
export function getDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  return window.showDirectoryPicker();
}

/**
 * Reads the file content from a fileHandle and returns it as a string.
 */
export async function readFileHandleAsText(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile() as any; // as any because .text not yet documented in TS
  return file.text();
}

/**
 * Reads the file content from a fileHandle and returns it as a Uint8Array.
 */
export async function readDirFileAsUint8Array(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<Uint8Array> {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const file = await fileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Create a handle to a new (text) file on the local file system.
 */
export function getNewFileHandle(
  name: string = '',
  description: string = 'Anita project data file',
  accept: { [mimeType: string]: Array<string> } = { 'application/json': ['.json'] }
): Promise<FileSystemFileHandle> {
  const opts = {
    types: [{
      name,
      description,
      accept
    }]
  };
  return window.showSaveFilePicker(opts);
}

/**
 * Reads the raw text from a file.
 */
export function readFile(file: any): Promise<string> {
  // If the new .text() reader is available, use it.
  if (file.text) {
    return file.text();
  }
  // Otherwise use the traditional file reading technique.
  return _readFileLegacy(file) as Promise<string>;
}

/**
 * Reads the raw text from a file.
 */
function _readFileLegacy(file: any): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener('loadend', e => {
      const text = e.target.result;
      resolve(text as string);
    });
    reader.readAsText(file);
  });
}

/**
 * Writes the contents to disk.
 */
export async function writeFile(fileHandle: FileSystemFileHandle, contents: FileSystemWriteChunkType): Promise<void> {
  // For Chrome 83 and later.
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
}

/**
 * Verify the user has granted permission to read or write to the file, if
 * permission hasn't been granted, request permission.
 */
export async function verifyPermission(fileHandle: FileSystemFileHandle, withWrite: boolean): Promise<boolean> {
  const opts = {} as any;
  if (withWrite) {
    opts.writable = true;
    opts.mode = 'readwrite';
  }
  // Check if we already have permission, if so, return true.
  if (await fileHandle.queryPermission(opts) === 'granted') {
    return true;
  }
  // Request permission to the file, if the user grants permission, return true.
  if (await fileHandle.requestPermission(opts) === 'granted') {
    return true;
  }
  // The user did nt grant permission, return false.
  return false;
}
