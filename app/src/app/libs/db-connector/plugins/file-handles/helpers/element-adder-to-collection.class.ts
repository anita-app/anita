import { AnitaUniversalDataStorage, SectionElement } from 'app/data/model/project-info';
import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers';
import { ProjectFileHandleSaver } from 'app/libs/db-connector/plugins/file-handles/helpers/project-file-handle-saver.class';

export class ElementAdderToCollection<E> {

  private index: number;

  /**
   * Creates an instance of db ElementAdderToCollection.
   * @param dbConnector the instance of DbConnector from which ElementAdderToCollection is called
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor(
    protected dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>,
    protected section: keyof AbstractModel,
    protected element: Partial<E>
  ) { }

  protected async save(): Promise<void> {
    this.setSectionStore();
    this.checkIfElementInStoreAndSetIndex();
    this.addToStore();
    await new ProjectFileHandleSaver(this.dbConnector).save();
  }

  /**
   * Sets the index of the element being saved if it was already in the store, else assigns the lenght of the array to push it at the end.
   *
   * @remarks The index is used by `addToStore` to replace the existing element with the new one when in edit mode.
   */
  protected checkIfElementInStoreAndSetIndex(): void {
    const elements = this.dbConnector.dbStore.db[this.section] as Array<SectionElement>;
    const check = elements.findIndex(ele => this.element[this.dbConnector.DS[this.section].pk] === ele[this.dbConnector.DS[this.section].pk]);
    this.index = (check >= 0) ? check : elements.length;
  }

  /**
   * Sets an ampty array is the project did not have one already
   */
  private setSectionStore(): void {
    if (!this.dbConnector.dbStore.db[this.section])
      this.dbConnector.dbStore.db[this.section] = [];
  }

  /**
   * Adds the element to the end of the store if it's a new element, otherwise replaces the existing element.
   */
  private addToStore(): void {
    this.dbConnector.dbStore.db[this.section][this.index] = this.element as unknown as SectionElement;
  }

}
