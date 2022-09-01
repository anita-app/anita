import { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import { Database } from 'sql.js'

export async function executeQueryNoReturn (dbConnector: DbConnectorInstance<Database>, query: string): Promise<void> {
  await dbConnector.dbStore.db.run(query)
}
