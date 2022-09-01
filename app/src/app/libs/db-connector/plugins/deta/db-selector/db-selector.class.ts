import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Selector } from 'app/libs/db-connector/models/executers'
import Base from 'deta/dist/types/base'
import { CompositeType } from 'deta/dist/types/types/basic'

/**
 * Implements selector for Deta Base
 */
export class DbSelector<E> implements Selector<E> {
  private data: Array<E> = []

  /**
   * Creates an instance of db selector.
   * @param section the section from which to query data
   * @param [args] the optional arguments of the query
   */
  constructor (
    private dbConnector: DbConnectorInstance<Base>,
    private section: keyof AbstractModel,
    private args?: Partial<E>
  ) { }

  /**
   * Retrieves only one element
   */
  public async single (): Promise<E> {
    // not implemented
    return this.multiple()?.[0]
  }

  /**
   * Retrieves multiple elements, returns them in an `Array`
   */
  public async multiple (): Promise<Array<E>> {
    await this.executeSelect()

    return this.data
  }

  /**
   * Counts all elements in the section
   *
   * @remarks does not take into consideration argumeents
   */
  public async count (): Promise<number> {
    await this.multiple()
    return this.data?.length
  }

  /**
   * Executes the select command
   */
  private async executeSelect (): Promise<void> {
    this.data = await this.dbConnector.dbStore.db.fetch(this.args as unknown as CompositeType) as unknown as Array<E>
  }
}
