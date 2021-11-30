import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers';
import { Logger } from 'app/libs/logger/logger.class';
import * as mysql from 'mysql';
import { Database } from 'sql.js';
import * as squel from 'squel';

export interface WhereArgs {
  field: string;
  operator: string;
  value: number | string;
}

/**
 * Prepares queries to be executed on a MySql DB
 */
export class QueryMaker<S> {

  /**
   * Creates an instance of query maker.
   * @param section the section on which to run the qeury
   * @param [element] optional element on which to run the query
   */
  constructor(
    private dbConnector: DbConnectorInstance<mysql.Connection | Database>,
    private section: keyof AbstractModel,
    private element?: Object
  ) { }

  /**
   * Builds the `SELECT` query
   */
  public select(whereArgs: Array<WhereArgs> = []): string {
    const obj = squel.select({ autoQuoteTableNames: true, autoQuoteFieldNames: true }).from(this.dbConnector.DS[this.section].name);
    if (whereArgs.length)
      whereArgs.forEach(whereArg => obj.where(`${whereArg.field} ${whereArg.operator} ?`, whereArg.value));
    return obj.toString();
  }

  /**
   * Builds the `INSERT` query
   */
  public insert(): string {
    const element = { ...this.element };
    for (const prop in element)
      this.fieldsRemoverIfThereIsNoColumn(element, prop);

    return squel.insert({ autoQuoteTableNames: true, autoQuoteFieldNames: true })
      .into(this.dbConnector.DS[this.section].name)
      .setFieldsRows([element])
      .toString();
  }

  /**
   * Builds the `UPDATE` query
   */
  public update(): string {
    const obj = squel.update({ autoQuoteTableNames: true, autoQuoteFieldNames: true }).table(this.dbConnector.DS[this.section].name);
    const element = { ...this.element };

    for (const prop in element)
      if (prop !== this.dbConnector.DS[this.section].pk) {
        this.fieldsRemoverIfThereIsNoColumn(element, prop);
        obj.set(prop, element[prop]);
      }
    const pk = this.dbConnector.DS[this.section].pk as string;
    obj.where(`${pk} = ?`, element[this.dbConnector.DS[this.section].pk]);

    return obj.toString();
  }

  /**
   * Builds the `DELETE` query
   */
  public delete(whereArgs: Array<WhereArgs> = []): string {
    const obj = squel.delete({ autoQuoteTableNames: true, autoQuoteFieldNames: true }).from(this.dbConnector.DS[this.section].name);
    if (whereArgs.length)
      whereArgs.forEach(whereArg => obj.where(`${whereArg.field} ${whereArg.operator} ?`, whereArg.value));
    return obj.toString();
  }

  /**
   * Removes properties for which there is not a column in DB
   */
  private fieldsRemoverIfThereIsNoColumn(element: Object, prop: string): void {
    if (!this.dbConnector.DS[this.section].fields.includes(prop)) {
      delete element[prop];
      Logger.warn(`WARNING: field ${prop} removed because no corresponding column was found in the schema.`);
    }
  }

}
