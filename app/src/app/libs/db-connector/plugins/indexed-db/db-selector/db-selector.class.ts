import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Selector } from 'app/libs/db-connector/models/executers'
import { QueryMaker } from 'app/libs/db-connector/plugins/indexed-db/query-makers/query-maker.class'
import Dexie from 'dexie'

/**
 * Implements selector for IndexedDB
 */
export class DbSelector<E> implements Selector<E> {
  private data: Array<E> = []
  private qe!: QueryMaker<E>

  /**
   * Creates an instance of db selector.
   * @param section the section from which to query data
   * @param [args] the optional arguments of the query
   */
  constructor (
    private dbConnector: DbConnectorInstance<Dexie>,
    private section: keyof AbstractModel,
    private args?: Partial<E>
  ) { }

  /**
   * Retrieves only one element
   */
  public async single (): Promise<E> {
    this.setUpSelect()
    this.setQuery()
    await this.executeSelect()

    return this.data[0]
  }

  /**
   * Retrieves multiple elements, returns them in an `Array`
   */
  public async multiple (): Promise<Array<E>> {
    this.setUpSelect()
    this.setQuery()
    this.setOrder()

    await this.executeSelect()

    return this.data
  }

  /**
   * Counts all elements in the section
   *
   * @remarks does not take into consideration argumeents
   */
  public async count (): Promise<number> {
    return new QueryMaker(this.dbConnector, this.section).count()
  }

  /**
   * Creates an instance of `QueryMaker`
   *
   * @see QueryMaker
   */
  private setUpSelect (): void {
    this.qe = new QueryMaker(this.dbConnector, this.section)
  }

  /**
   * If the `pk` value is set, it is added as a query argument
   */
  private setQuery (): void {
    if (!this.args) {
      return
    }

    if (this.args[this.dbConnector.DS[this.section].pk as keyof E]) {
      this.qe.addWhere([this.dbConnector.DS[this.section].pk, '=', this.args[this.dbConnector.DS[this.section].pk as keyof E] as unknown as string | number])
    }
  }

  /**
   * Sets the order of the results
   */
  private setOrder (): void {
    this.qe.setOrderBy(this.dbConnector.DS[this.section].orderBy)
  }

  /**
   * Executes the select command
   */
  private async executeSelect (): Promise<void> {
    this.data = await this.qe.select()
  }
}
