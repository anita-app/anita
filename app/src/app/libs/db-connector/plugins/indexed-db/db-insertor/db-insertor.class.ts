import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Insertor } from 'app/libs/db-connector/models/executers'
import { QueryMaker } from 'app/libs/db-connector/plugins/indexed-db/query-makers/query-maker.class'
import { Logger } from 'app/libs/logger/logger.class'
import Dexie, { Table } from 'dexie'

/**
 * Implements insertor for IndexedDB
 */
export class DbInsertor<E> implements Insertor<E> {
  /**
   * Creates an instance of db insertor.
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor (
    private dbConnector: DbConnectorInstance<Dexie>,
    private section: keyof AbstractModel,
    private element: Array<E> | E
  ) { }

  /**
   * Makes sure that all necessary fields are set and performs the insert
   */
  public autoInsert (): Promise<void> {
    if (this.element instanceof Array) {
      return this.insertMany()
    }
    return this.insertOne()
  }

  private async insertMany (): Promise<void> {
    const table = this.dbConnector.DS[this.section].name
    await (this.dbConnector.dbStore.db[table as keyof Dexie] as unknown as Table).bulkPut(this.element as Array<E>)
  }

  private insertOne (): Promise<void> {
    return new QueryMaker(this.dbConnector, this.section, this.element)
      .insert()
      .catch(err => {
        Logger.error('Error in autoinsert: ', err)
      })
  }
}
