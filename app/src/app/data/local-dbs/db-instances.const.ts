import { AnitaUniversalDataStorage } from 'app/data/project-structure/project-info';
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers';
import Dexie from 'dexie';
import { Db } from 'mongodb';
import * as mysql from 'mysql';
import { Database } from 'sql.js';

interface DbInstances {
  system: DbConnectorInstance<Dexie>;
  [projectIdentifier: string]: DbConnectorInstance<Dexie | Db | mysql.Connection | AnitaUniversalDataStorage | Database>;
}

export const dbInstances: DbInstances = {
  system: undefined
};
