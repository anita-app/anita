import { FileSystemDirectoryHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { Database } from 'sql.js';

// We can't write in place to the db, see https://wicg.github.io/file-system-access/#api-filesystemdirectoryhandle-removeentry ISSUE 6
export async function schemaExporter(db: Database, dirHandle: FileSystemDirectoryHandle): Promise<void> {
  console.log('Exporting schema...');
  const binaryArray = db.export();
  const blob = new Blob([binaryArray]);
  const fileHandle = await dirHandle.getFileHandle('test.db', { create: true })
  const writable = await fileHandle.createWritable({ keepExistingData: true });
  await writable.write(blob);
  await writable.close();
}
