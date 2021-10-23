import { DbConnectorInstance } from '@anita/client/libs/db-connector/models/executers';
import Dexie from 'dexie';
import { Db } from 'mongodb';
import * as mysql from 'mysql';

interface DbInstances {
  system: DbConnectorInstance<Dexie>;
  [projectIdentifier: string]: DbConnectorInstance<Dexie | Db | mysql.Connection>;
}

export const dbInstances: DbInstances = {
  system: undefined
};
