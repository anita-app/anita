import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import { Filter4Dexie, QueryHelper, SuppoertedOperators } from 'app/libs/db-connector/plugins/indexed-db/query-makers/query-helper.class'
import { Logger } from 'app/libs/Logger/logger.class'
import Dexie from 'dexie'

export type NewWhere = [string, SuppoertedOperators, string | number];

/**
 * Builds queries to be executed with Dexie
 */
export class QueryMaker<E> {
  private logic: 'AND' | 'OR' = 'AND'
  private table: string
  private collection
  private dexieFilters: Array<Filter4Dexie> = []
  private arrWhere: Array<NewWhere> = []
  private orderBy: string
  private debug = false

  /**
   * Creates an instance of query maker.
   * @param section the section name (aka table) on which to run the query
   * @param [element] optional element on which to perform the query
   */
  constructor (
    private dbConnector: DbConnectorInstance<Dexie>,
    private section: keyof AbstractModel,
    private element?: E
  ) {
    this.table = this.dbConnector.DS[this.section].name
    this.collection = this.dbConnector.dbStore.db[this.table]
  }

  /**
   * Adds a where clause to `arrWhere`
   */
  public addWhere (newWhere: NewWhere): QueryMaker<E> {
    this.arrWhere.push(newWhere)
    return this
  }

  /**
   * Sets the logic to OR
   */
  public setOrLogic (): QueryMaker<E> {
    this.logic = 'OR'
    return this
  }

  /**
   * Sets the orderBy property
   */
  public setOrderBy (order: string): void {
    this.orderBy = order
  }

  // SELECT

  /**
   * Determines which method to execute and then performs the select operation
   */
  public async select (): Promise<Array<E>> {
    if (this.logic !== 'AND') {
      return this.complexSelect()
    }

    const methodToExecute = QueryHelper.methodToExecute(this.dbConnector.DS, this.arrWhere, this.section)

    this.handleDebug('SELECT', 'methodToExecute', methodToExecute)

    return this[methodToExecute]()
  }

  /**
   * Select with Dexie.get
   */
  private async dexieGet (): Promise<Array<E>> {
    const objSearch = {}
    objSearch[this.arrWhere[0][0]] = this.arrWhere[0][2]
    const res = await this.dbConnector.dbStore.db[this.table].get(objSearch)
    const eleToReturn = res ? [res] : []
    return eleToReturn
  }

  /**
   * Selects using the where method of Dexie
   */
  private async dexieWhere (): Promise<Array<E>> {
    const fieldNValues = QueryHelper.buildArrayFildsNValues(this.arrWhere)
    return this.dbConnector.dbStore.db[this.table].where(fieldNValues).toArray()
  }

  /**
   * Select between two values with Dexie
   */
  private async dexieBetween (): Promise<Array<E>> {
    const betweenSearchParams = QueryHelper.buildBetweenSearchParams(this.arrWhere)
    return this.dbConnector.dbStore.db[this.table].where(betweenSearchParams.field)
      .between(betweenSearchParams.lowerBound, betweenSearchParams.upperBound, betweenSearchParams.includeLower, betweenSearchParams.includeUpper)
      .toArray()
  }

  /**
   * Gets entire collection with Dexie
   */
  private async dexieFullCollection (): Promise<Array<E>> {
    return this.dbConnector.dbStore.db[this.table].toArray()
  }

  /**
   * Performs a comples select action that is not supported natively by IndexedDB (and so Dexie)
   */
  private complexSelect (): Promise<Array<E>> {
    this.arrWhere.forEach(arrWhere => this.dexieFilters.push(QueryHelper.buildFilter4Dexie(arrWhere))
    )

    let allRecords = this.dbConnector.dbStore.db[this.table].toCollection()
    const filter = QueryHelper.chainFilters(this.dexieFilters, this.logic)
    allRecords = allRecords.and(filter)

    this.handleDebug('SELECT', 'WHERE', this.arrWhere)

    if (this.orderBy) {
      return allRecords.sortBy(this.orderBy)
    }

    return allRecords.toArray()
  }

  // INSERT

  /**
   * Inserts a new element using `put` method of Dexie
   */
  public async insert (): Promise<void> {
    this.handleDebug('INSERT', 'WITH OBJECT', this.element)

    await this.dbConnector.dbStore.db[this.table].put(this.element)
  }

  // UPDATE

  /**
   * Updates and element using the `update` method of Dexie
   */
  public async update (): Promise<void> {
    this.handleDebug('UPDATE', 'WITH OBJECT', this.element)

    await this.dbConnector.dbStore.db[this.table].update(this.element[this.dbConnector.DS[this.section].pk], this.element)
  }

  // COUNT

  /**
   * Counts the number of items in a collection with Dexie
   */
  public count (): Promise<number> {
    return this.collection.count()
  }

  // DELETE

  /**
   * Deletes one or more elements with the `where` clause of Dexie
   */
  public async delete (): Promise<void> {
    const fieldNValues = QueryHelper.buildArrayFildsNValues(this.arrWhere)

    this.handleDebug('DELETE', 'WHERE', this.arrWhere)

    await this.dbConnector.dbStore.db[this.table].where(fieldNValues).delete()
  }

  /**
   * Clears the entire db!!!
   */
  public async clearDb (): Promise<void> {
    const promises = []
    for (const section in this.dbConnector.DS) {
      if (this.dbConnector.DS[section].name) promises.push(this.dbConnector.dbStore.db[this.dbConnector.DS[section].name].clear())
    }

    await Promise.all(promises)
  }

  /**
   * Clears an entire table!!!
   */
  public async clearTable (): Promise<void> {
    await this.dbConnector.dbStore.db[this.table].clear()
  }

  /**
   * Logs useful information in the console if `debug` is true
   */
  private handleDebug<T> (action: string, typeToShow: string, toShow: T): void {
    if (this.debug) {
      Logger.raw(`EXECUTING ${action} FOR TABLE ${this.table} ${typeToShow} `, toShow)
    }
  }
}
