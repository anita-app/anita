import { QueryMaker } from 'app/libs/db-connector/common-helpers/query-maker.class'
import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Updator } from 'app/libs/db-connector/models/executers'
import { FileSystemDirectoryHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { executeQueryNoReturn } from 'app/libs/db-connector/plugins/sqlite/helpers/execute-query-no-return.function'
import { schemaExporter } from 'app/libs/db-connector/plugins/sqlite/helpers/schema-exporter.function'
import { cloneDeep } from 'lodash'
import { Database } from 'sql.js'

/**
 * Implements updator for MySql
 */
export class DbUpdator<E> implements Updator<E> {
  /**
   * Creates an instance of db ElementAdderToCollection.
   * @param dbConnector the instance of DbConnector from which ElementAdderToCollection is called
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor (
    protected dbConnector: DbConnectorInstance<Database>,
    protected section: keyof AbstractModel,
    protected elements: Array<Partial<E>> | Partial<E>
  ) { }

  /**
   * Updates an element in the collection
   */
  public async autoUpdate (): Promise<void> {
    if (this.dbConnector.options.encrypted) {
      await this.handleEncryption()
    }

    const query: Array<string> = []

    if (this.elements instanceof Array) {
      for (const element of this.elements) {
        query.push(this.buildQuery(element))
      }
    } else {
      query.push(this.buildQuery(this.elements))
    }

    executeQueryNoReturn(this.dbConnector, query.join(';'))

    await schemaExporter(
      this.dbConnector.dbStore.db,
      this.dbConnector.options.projectInfo!.fileHandle as any as FileSystemDirectoryHandle,
      this.dbConnector.options.projectInfo!.id
    )
  }

  private buildQuery (element: Partial<E>): string {
    const copyEle = { ...element }

    if (this.dbConnector.DS[this.section].jsonFields?.length) {
      for (const field of this.dbConnector.DS[this.section].jsonFields) {
        copyEle[field as keyof E] = JSON.stringify(copyEle[field as unknown as keyof E]) as unknown as E[keyof E]
      }
    }

    return new QueryMaker(this.dbConnector, this.section, copyEle).update()
  }

  /**
   * Handles encryption
   *
   * Since cloneDeep is used, the original object is not modified
   * We use cloneDeep only here as it's slower and an overkill if there is no encryption
   * @see Encrypter
   */
  private async handleEncryption (): Promise<void> {
    this.elements = cloneDeep(this.elements)
    if (this.elements instanceof Array) {
      for (const element of this.elements) {
        await new Encrypter(this.dbConnector, this.section, element).do()
      }
    } else {
      await new Encrypter(this.dbConnector, this.section, this.elements).do()
    }
  }
}
