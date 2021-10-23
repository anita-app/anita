import { DsDbInitOptions } from '@anita/client/libs/db-connector/models/executers';
import { FileSystemFileHandle } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { getNewFileHandle, verifyPermission } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/fs-helper';

/**
 * Uses the fileHandle stored in IndexedDB, if any, or asks for a new one 
 */
export async function fileHandleChecker(options: DsDbInitOptions): Promise<FileSystemFileHandle> {
  if (!options.projectInfo.fileHandle)
    return await getNewFileHandle(`anita-fh-${options.projectInfo.id}`);

  await verifyPermission(options.projectInfo.fileHandle, true);
  return options.projectInfo.fileHandle;

}
