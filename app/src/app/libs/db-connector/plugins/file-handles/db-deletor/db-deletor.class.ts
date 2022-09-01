import { AnitaUniversalDataStorage } from 'app/data/project-structure/project-info'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Deletor } from 'app/libs/db-connector/models/executers'
import { ProjectFileHandleSaver } from 'app/libs/db-connector/plugins/file-handles/helpers/project-file-handle-saver.class'

/**
 * Implements deletor for MySql
 */
export class DbDeletor<E> implements Deletor<E> {
  /**
   * Creates an instance of db deletor.
   * @param section the section on which to perform the query
   * @param args the args of the query
   */
  constructor (
    private dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>,
    private section: keyof AbstractModel,
    private args: Partial<E>
  ) { }

  /**
   * Deletes an element from the collection
   */
  public async autoDelete (): Promise<any> {
    if (!Object.keys(this.args).length) {
      return 'Fatal error: trying to delete without any parameter'
    }

    // eslint-disable-next-line dot-notation
    const indexElement = this.dbConnector.dbStore.db[this.section].findIndex(ele => ele.id === this.args['id'])
    // Remove the element from the collection
    this.dbConnector.dbStore.db[this.section].splice(indexElement, 1)
    await new ProjectFileHandleSaver(this.dbConnector).save()
  }

  public async clearSection (): Promise<void> {
    this.dbConnector.dbStore.db[this.section].length = 0
    await new ProjectFileHandleSaver(this.dbConnector).save()
  }
}
