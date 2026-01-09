import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import Dexie from 'dexie'
import { Database } from 'sql.js'

interface DbInstances {
  system: DbConnectorInstance<Dexie>
  [projectIdentifier: string]: DbConnectorInstance<Dexie | TAnitaUniversalDataStorage | Database>
}

export const dbInstances: DbInstances = {
  system: undefined as any
}
