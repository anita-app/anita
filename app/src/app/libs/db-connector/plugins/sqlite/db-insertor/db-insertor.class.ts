import { QueryMaker } from 'app/libs/db-connector/common-helpers/query-maker.class';
import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class';
import { DbConnectorInstance, Insertor } from 'app/libs/db-connector/models/executers';
import { executeQueryNoReturn } from 'app/libs/db-connector/plugins/sqlite/helpers/execute-query-no-return.function';
import { schemaExporter } from 'app/libs/db-connector/plugins/sqlite/helpers/schema-exporter.function';
import { Database } from 'sql.js';

/**
 * Implements insertor for MySql
 */
export class DbInsertor<E> implements Insertor<E> {

  /**
   * Creates an instance of db ElementAdderToCollection.
   * @param dbConnector the instance of DbConnector from which ElementAdderToCollection is called
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor(
    protected dbConnector: DbConnectorInstance<Database>,
    protected section: keyof AbstractModel,
    protected elements: Array<Partial<E>> | Partial<E>
  ) { }

  /**
   * Adds an element to the collection
   */
  public async autoInsert(): Promise<void> {
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();

    if (this.dbConnector.DS[this.section].jsonFields?.length)
      this.handleJsonFields();

    if (this.elements instanceof Array) {
      // TODO: handle multiple elements with one query
      for (const element of this.elements)
        await this.insert(element);
    } else {
      await this.insert(this.elements);
    }

    await schemaExporter(this.dbConnector.dbStore.db, this.dbConnector.options.projectInfo.fileHandle);
  }

  private async insert(element: Partial<E>): Promise<void> {
    const query: string = new QueryMaker(this.dbConnector, this.section, element).insert();
    await executeQueryNoReturn(this.dbConnector, query);
  }

  private handleJsonFields(): void {
    if (this.elements instanceof Array) {
      for (const element of this.elements)
        this.handleJsonField(element);
    } else {
      this.handleJsonField(this.elements);
    }
  }

  private handleJsonField(element: Partial<E>): void {
    for (const jsonField of this.dbConnector.DS[this.section].jsonFields) {
      if (element[jsonField])
        element[jsonField] = JSON.stringify(element[jsonField]);
    }
  }

  /**
   * Handles encryption with Encrypter
   * 
   * @see Encrypter
   */
  private async handleEncryption(): Promise<void> {
    if (this.elements instanceof Array) {
      for (const element of this.elements)
        await new Encrypter(this.dbConnector, this.section, element).do();
    } else {
      await new Encrypter(this.dbConnector, this.section, this.elements).do();
    }
  }

}
