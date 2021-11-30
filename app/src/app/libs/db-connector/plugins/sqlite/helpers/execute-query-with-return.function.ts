import { Database } from 'sql.js';

export async function executeQueryWithReturn(db: Database, query: string): Promise<any> {
  return db.exec(query);
}