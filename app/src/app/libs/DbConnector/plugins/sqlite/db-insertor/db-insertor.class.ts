import { QueryMaker } from 'app/libs/DbConnector/common-helpers/query-maker.class'
import { Encrypter } from 'app/libs/DbConnector/crypter/encrypter.class'
import { AbstractModel } from 'app/libs/DbConnector/models/abstract-model'
import { DbConnectorInstance, Insertor } from 'app/libs/DbConnector/models/executers'
import { FileSystemDirectoryHandle } from 'app/libs/DbConnector/plugins/file-handles/helpers/file-system-access-api'
import { executeQueryNoReturn } from 'app/libs/DbConnector/plugins/sqlite/helpers/execute-query-no-return.function'
import { schemaExporter } from 'app/libs/DbConnector/plugins/sqlite/helpers/schema-exporter.function'
import { cloneDeep } from 'lodash'
import { Database } from 'sql.js'

/**
 * Implements insertor for MySql
 */
export class DbInsertor<E> implements Insertor<E> {
  protected elements: Array<Partial<E>> | Partial<E>

  /**
   * Creates an instance of db ElementAdderToCollection.
   * @param dbConnector the instance of DbConnector from which ElementAdderToCollection is called
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor (
    protected dbConnector: DbConnectorInstance<Database>,
    protected section: keyof AbstractModel,
    elements: Array<Partial<E>> | Partial<E>
  ) {
    // We need to cloneDeep as we don't want to modify the original elements when converting props to json
    this.elements = cloneDeep(elements)
  }

  /**
   * Adds an element to the collection
   */
  public async autoInsert (): Promise<void> {
    if (this.dbConnector.options.encrypted) {
      await this.handleEncryption()
    }

    if (this.dbConnector.DS[this.section].jsonFields?.length) {
      this.handleJsonFields()
    }

    const query: string = new QueryMaker(this.dbConnector, this.section, this.elements).insert()
    await executeQueryNoReturn(this.dbConnector, query)

    await schemaExporter(
      this.dbConnector.dbStore.db,
      this.dbConnector.options.projectInfo.fileHandle as any as FileSystemDirectoryHandle,
      this.dbConnector.options.projectInfo.id)
  }

  private handleJsonFields (): void {
    if (this.elements instanceof Array) {
      for (const element of this.elements) {
        this.handleJsonField(element)
      }
    } else {
      this.handleJsonField(this.elements)
    }
  }

  private handleJsonField (element: Partial<E>): void {
    for (const jsonField of this.dbConnector.DS[this.section].jsonFields) {
      if (element[jsonField]) {
        element[jsonField] = JSON.stringify(element[jsonField])
      }
    }
  }

  /**
   * Handles encryption with Encrypter
   *
   * @see Encrypter
   */
  private async handleEncryption (): Promise<void> {
    if (this.elements instanceof Array) {
      for (const element of this.elements) {
        await new Encrypter(this.dbConnector, this.section, element).do()
      }
    } else {
      await new Encrypter(this.dbConnector, this.section, this.elements).do()
    }
  }
}
