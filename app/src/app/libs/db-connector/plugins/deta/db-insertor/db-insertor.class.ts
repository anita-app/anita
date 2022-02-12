import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Insertor } from 'app/libs/db-connector/models/executers'
import Base from 'deta/dist/types/base'
import { DetaType, ObjectType } from 'deta/dist/types/types/basic'
import cloneDeep from 'lodash.clonedeep'

/**
 * Implements insertor for Deta Base
 */
export class DbInsertor<E> implements Insertor<E> {

  /**
   * Creates an instance of db insertor.
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor(
    private dbConnector: DbConnectorInstance<Base>,
    private section: keyof AbstractModel,
    private element: Array<E> | E
  ) { }

  /**
   * Makes sure that all necessary fields are set and performs the insert
   */
  public autoInsert(): Promise<void> {
    if (this.element instanceof Array) {
      return this.insertMany(this.element);
    } else {
      return this.insertOne(this.element);
    }
  }

  private async insertMany(originalElements: Array<E>): Promise<void> {
    const elements = cloneDeep(originalElements)
    elements.forEach(element => {
      element['key'] = element[RESERVED_FIELDS.id]
      element['section'] = this.section
      element['projectId'] = this.dbConnector.options.detaConnectionData.projectId;
    })
    await this.dbConnector.dbStore.db.putMany(elements as unknown as Array<DetaType>);
  }


  private async insertOne(originalElement: E): Promise<void> {
    const element = { ...originalElement };
    element['key'] = element[RESERVED_FIELDS.id];
    element['section'] = this.section;
    element['projectId'] = this.dbConnector.options.detaConnectionData.projectId;
    await this.dbConnector.dbStore.db.put(element as unknown as ObjectType);
  }

}
