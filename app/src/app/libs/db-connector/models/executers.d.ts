import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { SectionDefinition } from '@anita/client/libs/db-connector/db-builder/sez-definition';
import { ConnectionConfig } from 'mysql';

export interface DbConnectorConstructable<DbTypes> {
  new(
    allSez: Array<SectionDefinition<any>>,
    executers: DbObjects<unknown, DbTypes>,
    options: DsDbInitOptions
  ): DbConnectorInstance<DbTypes>;
}

export interface DbConnectorInstance<DbTypes> {
  dbStore: DbStoreInterface<DbTypes>;
  DS: AbstractModel;
  options: DsDbInitOptions;
  init(): Promise<DbConnectorInstance<DbTypes>>;
  callInsertor<E>(section: keyof AbstractModel, element: E): Insertor<E>;
  callSelector<E>(section: keyof AbstractModel, args?: Partial<E>): Selector<E>;
  callUpdator<E>(section: keyof AbstractModel, element: Partial<E>): Updator<E>;
  callDeletor<E>(section: keyof AbstractModel, args: Partial<E>): Deletor<E>;
}

/**
 * Interface of the object to be passed to DbInit as the plugin implementing the logic to perform queries on the storage facility.
 */
export interface DbObjects<E, DbTypes> {
  insertor: InsertorConstructable<E, DbTypes>,
  selector: SelectorConstructable<E, DbTypes>,
  updator: UpdatorConstructable<E, DbTypes>,
  deletor: DeletorConstructable<E, DbTypes>,
  dbStore?: DbStoreConstructable<DbTypes>
}


/**
 * Db connection data of a connected instance of MongoDB
 */
export interface DbConnectionData {
  connectionString: string;
  dbName: string;
}

/**
 * Connection details to connect to an instance of MongoDB
 */
export interface MongoDbConnectionData {
  username: string;
  password: string;
  dbName: string;
  url: Array<string>;
  params?: string;
}


/**
 * Options to initialize IndexedDB with Dexie
 */
export interface DsDbInitOptions {
  projectInfo?: LocalProjectSettings;
  mongoDbConnectionData?: MongoDbConnectionData;
  mySqlConnectionConfig?: ConnectionConfig;
  indexedDbName?: string;
  previousVersions?: Array<Array<SectionDefinition<any>>>;
  encrypted?: boolean;
  encryptionKeys?: { [userId: string]: string };
}

interface DbStoreConstructable<DbTypes> {
  new(
    dbConnector: DbConnectorInstance<DbTypes>,
    options: DsDbInitOptions
  ): DbStoreInterface<DbTypes>
}

interface DbStoreInterface<DbTypes> {
  db: DbTypes;
  initDB(): Promise<DbStoreInterface<DbTypes>>;
  close(): void;
}

/**
 * Defines the public interface that a Insertor Class must have
 */
interface InsertorConstructable<E, DbTypes> {
  new(
    dbConnector: DbConnectorInstance<DbTypes>,
    section: keyof AbstractModel,
    element: E
  ): Insertor<E>;
}
/**
 * Defines the public interface that a Insertor instance must have
 */
interface Insertor<E> {
  autoInsert(): Promise<void>;
}

/**
 * Defines the public interface that a Selector Class must have
 */
interface SelectorConstructable<E, DbTypes> {
  new(
    dbConnector: DbConnectorInstance<DbTypes>,
    section: keyof AbstractModel,
    args?: Partial<E>
  ): Selector<E>;
}

/**
 * Defines the public interface that a Selector instance must have
 */
interface Selector<E> {
  single(): Promise<E>;
  multiple(): Promise<Array<E>>
  count(): Promise<number>
}

/**
 * Defines the public interface that a Updator Class must have
 */
interface UpdatorConstructable<E, DbTypes> {
  new(
    dbConnector: DbConnectorInstance<DbTypes>,
    section: keyof AbstractModel,
    element: Partial<E>
  ): Updator<E>;
}

/**
 * Defines the public interface that a Updator instance must have
 */
interface Updator<E> {
  autoUpdate(): Promise<void>;
}

/**
 * Defines the public interface that a Deletor Class must have
 */
interface DeletorConstructable<E, DbTypes> {
  new(
    dbConnector: DbConnectorInstance<DbTypes>,
    section: keyof AbstractModel,
    args: Partial<E>
  ): Deletor<E>;
}

/**
 * Defines the public interface that a Deletor instance must have
 */
interface Deletor<E> {
  setDeleteChilds(): Deletor<E>;
  autoDelete(): Promise<void>;
}
