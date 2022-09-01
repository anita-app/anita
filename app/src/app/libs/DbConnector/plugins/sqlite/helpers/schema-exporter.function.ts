import { FileSystemDirectoryHandle } from 'app/libs/DbConnector/plugins/file-handles/helpers/file-system-access-api'
import { Logger } from 'app/libs/Logger/logger.class'
import { Database } from 'sql.js'

// We can't write in place to the db, see https://wicg.github.io/file-system-access/#api-filesystemdirectoryhandle-removeentry ISSUE 6
export async function schemaExporter (db: Database, dirHandle: FileSystemDirectoryHandle, projectId: string): Promise<void> {
  Logger.info('Exporting schema...')
  const binaryArray = db.export()
  const fileHandle = await dirHandle.getFileHandle(`${projectId}.db`, { create: true })
  const writable = await fileHandle.createWritable({ keepExistingData: true })
  await writable.write(binaryArray)
  await writable.close()
}
