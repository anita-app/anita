import { DbObjects } from '@anita/client/libs/db-connector/models/executers';
import { Db } from 'mongodb';
import { DbDeletor } from './db-deletor/db-deletor.class';
import { DbInsertor } from './db-insertor/db-insertor.class';
import { DbSelector } from './db-selector/db-selector.class';
import { DbStore } from './db-store/dbstore.class';
import { DbUpdator } from './db-updator/db-updator.class';

/**
 * Constant to be passed to DbInit to use MongoDB as plugin
 */
export const MONGO_DB_PLUGIN: DbObjects<any, Db> = {
  insertor: DbInsertor,
  selector: DbSelector,
  updator: DbUpdator,
  deletor: DbDeletor,
  dbStore: DbStore
};
