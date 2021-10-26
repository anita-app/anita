import { AnitaUniversalDataStorage } from '@anita/client/data/model/project-info';
import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { Decrypter } from '@anita/client/libs/db-connector/crypter/decrypter.class';
import { DbConnectorInstance, Selector } from '@anita/client/libs/db-connector/models/executers';

export class DbSelector<E> implements Selector<E> {

  private results: Array<any>;

  constructor(
    private dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>,
    private section: keyof AbstractModel,
    private args?: Partial<E>
  ) { }

  /**
   * Gets one element with doSelect
   * 
   * @see doSelect
   */
  public async single(): Promise<E> {
    await this.doSelect();

    if (!this.results.length)
      return;

    return this.results.find(ele => this.filterKeys(ele));
  }

  private filterKeys(eleToCheck: E): boolean {
    const keys = Object.keys(this.args);
    let res = true;
    let counter = 0;
    while (res && counter < keys.length) {
      res = eleToCheck[keys[counter]] === this.args[keys[counter]];
      counter++;
    }
    return res;
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
    this.results = this.dbConnector.dbStore.db[this.section] && this.dbConnector.dbStore.db[this.section].length ? this.dbConnector.dbStore.db[this.section] : [];
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
