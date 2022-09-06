import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Updator } from 'app/libs/db-connector/models/executers'
import Base from 'deta/dist/types/base'
import { ObjectType } from 'deta/dist/types/types/basic'

/**
 * Implements updator for IndexedDb
 */
export class DbUpdator<E> implements Updator<E> {
  /**
   * Creates an instance of db updator.
   * @param section the section of the element to update
   * @param element the full element updated
   */
  constructor (
    private dbConnector: DbConnectorInstance<Base>,
    private section: keyof AbstractModel,
    private element: Partial<any>
  ) { }

  /**
   * Calls `QueryMaker` and updates the element
   */
  public async autoUpdate (): Promise<void> {
    const element = { ...this.element }
    element.key = element[RESERVED_FIELDS.id]
    element.section = this.section
    element.projectId = this.dbConnector.options.detaConnectionData!.projectId
    await this.dbConnector.dbStore.db.update(element as unknown as ObjectType, this.element[RESERVED_FIELDS.id])
  }
}
