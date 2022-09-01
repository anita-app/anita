import { DbConnectorInstance } from 'app/libs/DbConnector/models/executers'
import { Database } from 'sql.js'

export async function executeQueryNoReturn (dbConnector: DbConnectorInstance<Database>, query: string): Promise<void> {
  await dbConnector.dbStore.db.run(query)
}
