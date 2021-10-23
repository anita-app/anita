import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance } from '@anita/client/libs/db-connector/models/executers';
import { Logger } from '@anita/client/libs/logger/logger.class';
import * as mysql from 'mysql';
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
    private dbConnector: DbConnectorInstance<mysql.Connection>,
    private section: keyof AbstractModel,
    private element?: Object
  ) { }

  /**
   * Builds the `SELECT` query
   */
  public select(whereArgs: Array<WhereArgs> = []): string {
    const obj = squel.select().from(this.dbConnector.DS[this.section].name);
    if (whereArgs.length)
      whereArgs.forEach(whereArg => obj.where(`${whereArg.field} ${whereArg.operator} ?`, whereArg.value));
    return obj.toString();
  }

  /**
   * Builds the `INSERT` query
   */
  public insert(): string {
    for (const prop in this.element)
      this.fieldsRemoverIfThereIsNoColumn(prop);

    return squel.insert()
      .into(this.dbConnector.DS[this.section].name)
      .setFieldsRows([this.element])
      .toString();
  }

  /**
   * Builds the `UPDATE` query
   */
  public update(): string {
    const obj = squel.update().table(this.dbConnector.DS[this.section].name);

    for (const prop in this.element)
      if (prop !== this.dbConnector.DS[this.section].pk) {
        this.fieldsRemoverIfThereIsNoColumn(prop);
        obj.set(prop, this.element[prop]);
      }
    const pk = this.dbConnector.DS[this.section].pk as string;
    obj.where(`${pk} = ?`, this.element[this.dbConnector.DS[this.section].pk]);

    return obj.toString();
  }

  /**
   * Builds the `DELETE` query
   */
  public delete(whereArgs: Array<WhereArgs> = []): string {
    const obj = squel.delete().from(this.dbConnector.DS[this.section].name);
    if (whereArgs.length)
      whereArgs.forEach(whereArg => obj.where(`${whereArg.field} ${whereArg.operator} ?`, whereArg.value));
    return obj.toString();
  }

  /**
   * Removes properties for which there is not a column in DB
   */
  private fieldsRemoverIfThereIsNoColumn(prop: string): void {
    if (!this.dbConnector.DS[this.section].fields.includes(prop)) {
      delete this.element[prop];
      Logger.warn(`WARNING: field ${prop} removed because no corresponding column was found in the schema.`);
    }
  }

}
