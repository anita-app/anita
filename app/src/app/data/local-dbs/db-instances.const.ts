import { AnitaUniversalDataStorage } from 'app/data/project-structure/project-info'
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import Base from 'deta/dist/types/base'
import Dexie from 'dexie'
import * as mysql from 'mysql'
import { Database } from 'sql.js'

interface DbInstances {
  system: DbConnectorInstance<Dexie>
  [projectIdentifier: string]: DbConnectorInstance<Dexie | Base | mysql.Connection | AnitaUniversalDataStorage | Database>
}

export const dbInstances: DbInstances = {
  system: undefined as any
}
