import { Decrypter } from 'app/libs/db-connector/crypter/decrypter.class';
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model';
import { DbConnectorInstance, Selector } from 'app/libs/db-connector/models/executers';
import { Db } from 'mongodb';

/**
 * Implements selector for MongoDB
 * @template E 
 */
export class DbSelector<E> implements Selector<E> {

  /**
   * The result(s) of the select action
   */
  private result: Array<E> | E;

  /**
   * Creates an instance of db selector.
   * @param section the section from which to select
   * @param [args] optional query params
   */
  constructor(
    private dbConnector: DbConnectorInstance<Db>,
    private section: keyof AbstractModel,
    private args?: Partial<E>
  ) { }

  /**
   * Gets one element. Checks the DB is connected, if not it esablishes a connection, and then calls doSingle
   * 
   * @see doSingle
   */
  public async single(): Promise<E> {
    if (this.dbConnector.dbStore['client'] && this.dbConnector.dbStore['client'].isConnected())
      return this.doSingle();

    await this.dbConnector.dbStore.initDB();

    return this.single();
  }

  /**
   * Gets multiple elements in an Array. Checks the DB is connected, if not it esablishes a connection, and then calls doMultiple
   * 
   * @see doMultiple
   */
  public async multiple(): Promise<Array<E>> {
    if (this.dbConnector.dbStore['client'] && this.dbConnector.dbStore['client'].isConnected())
      return this.doMultiple();

    await this.dbConnector.dbStore.initDB();

    return this.multiple();
  }

  /**
   * Counts elements of the section. Checks the DB is connected, if not it esablishes a connection, and then calls doCount
   * 
   * @see doCount
   */
  public async count(): Promise<number> {
    if (this.dbConnector.dbStore['client'] && this.dbConnector.dbStore['client'].isConnected())
      return this.doCount();

    await this.dbConnector.dbStore.initDB();

    return this.count();
  }

  /**
   * Fetches one element and decrypts is
   * 
   * @see Decrypter
   */
  private async doSingle(): Promise<E> {
    this.result = await this.dbConnector.dbStore.db.collection(this.dbConnector.DS[this.section].name)
      .findOne(this.args) as unknown as E;

    if (this.result && this.dbConnector.options.encrypted)
      await new Decrypter(this.dbConnector, this.section, this.result).do();

    return (this.result === null) ? undefined : this.result as E;
  }

  /**
   * Fetches multiple elements and decrypts them
   * 
   * @see Decrypter
   */
  private async doMultiple(): Promise<Array<E>> {
    this.result = await this.dbConnector.dbStore.db.collection(this.dbConnector.DS[this.section].name)
      .find(this.args)
      .toArray() as Array<E>;

    if (this.result.length && this.dbConnector.options.encrypted)
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.result.length; i++)
        await new Decrypter(this.dbConnector, this.section, this.result[i]).do();

    return this.result as Array<E>;
  }

  /**
   * TODO
   */
  private async doCount(): Promise<number> {
    const res = await new Promise(resolve => { }) as number;
    return res;
  }

}
