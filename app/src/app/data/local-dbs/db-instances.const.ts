import type { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import type Dexie from 'dexie'

interface DbInstances {
  system: DbConnectorInstance<Dexie>
  [projectIdentifier: string]: DbConnectorInstance<Dexie>
}

export const dbInstances: DbInstances = {
  system: undefined as any,
}
