import { DbConnectorInstance } from 'app/libs/DbConnector/models/executers'
import * as mysql from 'mysql'

/**
 * Executes a prepared query
 */
export function executeQuery (dbConnector: DbConnectorInstance<mysql.Connection>, query: string): Promise<any> {
  return new Promise((resolve, reject) => dbConnector.dbStore.db.query(query, (err, results) => {
    if (err) reject(err)
    resolve(results)
  })
  )
}
