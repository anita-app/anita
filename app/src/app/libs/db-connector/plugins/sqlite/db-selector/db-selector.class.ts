import { QueryMaker } from 'app/libs/db-connector/common-helpers/query-maker.class';
import { WhereBuilder } from 'app/libs/db-connector/common-helpers/where-builder.class';
import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { Decrypter } from 'app/libs/db-connector/crypter/decrypter.class';
import { DbConnectorInstance, Selector } from 'app/libs/db-connector/models/executers';
import { executeQueryWithReturn } from 'app/libs/db-connector/plugins/sqlite/helpers/execute-query-with-return.function';
import { serializer } from 'app/libs/db-connector/plugins/sqlite/helpers/serializer.function';
import { Database } from 'sql.js';

export class DbSelector<E> extends WhereBuilder<E> implements Selector<E> {

  private results: Array<any>;

  constructor(
    private dbConnector: DbConnectorInstance<Database>,
    private section: keyof AbstractModel,
    args: Partial<E> = {}
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
    const query: string = new QueryMaker(this.dbConnector, this.section).count(this.whereArgs);
    const res = await executeQueryWithReturn(this.dbConnector.dbStore.db, query);

    if (!res.length)
      return 0;

    return res[0].values[0][0];
  }

  private async doSelect(): Promise<void> {
    this.count();
    const query: string = new QueryMaker(this.dbConnector, this.section).select(this.whereArgs);
    const res = await executeQueryWithReturn(this.dbConnector.dbStore.db, query);

    if (!res.length) {
      this.results = [];
      return;
    }

    this.results = serializer<E>(res[0].columns, res[0].values);

    if (this.dbConnector.options.encrypted)
      await this.handleDecryption();
    if (this.dbConnector.DS[this.section].jsonFields?.length)
      this.parseJsonFields();
  }

  private parseJsonFields(): void {
    this.results.forEach((element: Object) => {
      for (const prop in element)
        if (this.dbConnector.DS[this.section].jsonFields.includes(prop))
          element[prop] = JSON.parse(element[prop]);
    });
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
