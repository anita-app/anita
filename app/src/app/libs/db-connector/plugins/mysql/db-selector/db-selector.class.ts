import { QueryMaker } from 'app/libs/db-connector/common-helpers/query-maker.class';
import { WhereBuilder } from 'app/libs/db-connector/common-helpers/where-builder.class';
import { Decrypter } from 'app/libs/db-connector/crypter/decrypter.class';
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model';
import { DbConnectorInstance, Selector } from 'app/libs/db-connector/models/executers';
import { executeQuery } from 'app/libs/db-connector/plugins/mysql/helpers/execute-query.function';
import * as mysql from 'mysql';

export class DbSelector<E> extends WhereBuilder<E> implements Selector<E> {

  private results: Array<any>;

  constructor(
    private dbConnector: DbConnectorInstance<mysql.Connection>,
    private section: keyof AbstractModel,
    args?: Partial<E>
  ) {
    super(args);
  }

  /**
   * Gets one element with doSelect
   * 
   * @see doSelect
   */
  public async single(): Promise<E> {
    await this.doSelect();

    if (this.results.length)
      return this.results[0];

    return;
  }

  /**
   * Gets multiple elements in an Array with doSelect
   * 
   * @see doSelect
   */
  public async multiple(): Promise<Array<E>> {
    await this.doSelect();
    return this.results;
  }

  /**
   * Counts elements calling multiple and then calling `Array.lenght`
   * @see multiple
   */
  public async count(): Promise<number> {
    await this.multiple();
    return this.results.length;
  }

  /**
   * Builds the query with QueryMaker and runs it with executeQuery
   * 
   * @see QueryMaker
   * @see executeQuery
   */
  private async doSelect(): Promise<void> {
    const query: string = new QueryMaker(this.dbConnector, this.section).select(this.whereArgs);
    this.results = await executeQuery(this.dbConnector, query);
    await this.handleDecryption();
  }

  /**
   * Handles decryption
   * 
   * @see Decrypter 
   */
  private async handleDecryption(): Promise<void> {
    if (this.dbConnector.options.encrypted && this.results.length)
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.results.length; i++)
        await new Decrypter(this.dbConnector, this.section, this.results[i]).do();
  }

}
