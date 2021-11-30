import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { writeFile } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import { Database } from 'sql.js';

export function schemaExporter(db: Database, fileHandle: FileSystemFileHandle): Promise<void> {
  const binaryArray = db.export();
  const blob = new Blob([binaryArray]);
  return writeFile(fileHandle, blob);
}
