import { DbObjects } from '@anita/client/libs/db-connector/models/executers';
import { DbStore } from '@anita/client/libs/db-connector/plugins/indexed-db/db-store/dbstore.class';
import Dexie from 'dexie';
import { DbDeletor } from './db-deletor/db-deletor.class';
import { DbInsertor } from './db-insertor/db-insertor.class';
import { DbSelector } from './db-selector/db-selector.class';
import { DbUpdator } from './db-updator/db-updator.class';

/**
 * Constant to be passed to DbInit to use IndexedDB as plugin
 */
export const INDEXEDDB_PLUGIN: DbObjects<any, Dexie> = {
  insertor: DbInsertor,
  selector: DbSelector,
  updator: DbUpdator,
  deletor: DbDeletor,
  dbStore: DbStore
};
