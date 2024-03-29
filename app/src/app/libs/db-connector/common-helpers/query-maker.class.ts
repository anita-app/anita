import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import { Logger } from 'app/libs/logger/logger.class'
import { cloneDeep } from 'lodash'
import { Database } from 'sql.js'
import squel from 'squel'

export interface WhereArgs {
  field: string
  operator: string
  value: number | string
}

/**
 * Prepares queries to be executed on a MySql DB
 */
export class QueryMaker {
  /**
   * Creates an instance of query maker.
   * @param section the section on which to run the qeury
   * @param [element] optional element on which to run the query
   */
  constructor (
    private dbConnector: DbConnectorInstance<Database>,
    private section: keyof AbstractModel,
    private element?: Object | Array<Object>
  ) { }

  /**
   * Builds the `SELECT` query
   */
  public select (whereArgs: Array<WhereArgs> = []): string {
    const obj = squel.select({ autoQuoteTableNames: true, autoQuoteFieldNames: true }).from(this.dbConnector.DS[this.section].name)
    if (whereArgs.length) {
      whereArgs.forEach(whereArg => obj.where(`${whereArg.field} ${whereArg.operator} ?`, whereArg.value))
    }
    return obj.toString()
  }

  public count (whereArgs: Array<WhereArgs> = []): string {
    const obj = squel
      .select({ autoQuoteTableNames: true, autoQuoteFieldNames: false })
      .field('COUNT(*) as count')
      .from(this.dbConnector.DS[this.section].name)
    if (whereArgs.length) {
      whereArgs.forEach(whereArg => obj.where(`${whereArg.field} ${whereArg.operator} ?`, whereArg.value))
    }
    return obj.toString()
  }

  /**
   * Builds the `INSERT` query
   */
  public insert (): string {
    if (this.element instanceof Array) {
      return this.insertMany()
    }
    return this.insertOne()
  }

  private insertOne (): string {
    const element = { ...this.element }
    for (const prop in element) {
      this.fieldsRemoverIfThereIsNoColumn(element, prop as keyof Object)
    }

    return squel.insert({ autoQuoteTableNames: true, autoQuoteFieldNames: true })
      .into(this.dbConnector.DS[this.section].name)
      .setFields(element)
      .toString()
  }

  private insertMany (): string {
    const elements = cloneDeep(this.element) as Array<Object>
    elements.forEach(element => {
      for (const prop in element) {
        this.fieldsRemoverIfThereIsNoColumn(element, prop as keyof Object)
      }
    })

    return squel.insert({ autoQuoteTableNames: true, autoQuoteFieldNames: true })
      .into(this.dbConnector.DS[this.section].name)
      .setFieldsRows(elements)
      .toString()
  }

  /**
   * Builds the `UPDATE` query
   */
  public update (): string {
    const element = { ...this.element }

    for (const prop in element) {
      if (prop !== this.dbConnector.DS[this.section].pk) {
        this.fieldsRemoverIfThereIsNoColumn(element, prop as keyof Object)
      }
    }
    const obj = squel
      .update({ autoQuoteTableNames: true, autoQuoteFieldNames: true })
      .table(this.dbConnector.DS[this.section].name)
      .setFields(element)
    const pk = this.dbConnector.DS[this.section].pk as string
    obj.where(`${pk} = ?`, element[this.dbConnector.DS[this.section].pk as keyof Object])

    return obj.toString()
  }

  /**
   * Builds the `DELETE` query
   */
  public delete (whereArgs: Array<WhereArgs> = []): string {
    const obj = squel.delete({ autoQuoteTableNames: true, autoQuoteFieldNames: true }).from(this.dbConnector.DS[this.section].name)
    if (whereArgs.length) {
      whereArgs.forEach(whereArg => obj.where(`${whereArg.field} ${whereArg.operator} ?`, whereArg.value))
    }
    return obj.toString()
  }

  /**
   * Removes properties for which there is not a column in DB
   */
  private fieldsRemoverIfThereIsNoColumn (element: Object, prop: keyof Object): void {
    if (!this.dbConnector.DS[this.section].fields.includes(prop)) {
      delete element[prop]
      Logger.warn(`WARNING: field ${prop} removed because no corresponding column was found in the schema.`)
    }
  }
}
