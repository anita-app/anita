import { TAnitaUniversalDataStorage } from 'app/models/project-n/project.declarations'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import { ProjectFileHandleSaver } from 'app/libs/db-connector/plugins/file-handles/helpers/project-file-handle-saver.class'

export class ElementAdderToCollection<E> {
  private index!: number
  protected element!: Partial<E>
  /**
   * Creates an instance of db ElementAdderToCollection.
   * @param dbConnector the instance of DbConnector from which ElementAdderToCollection is called
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor (
    protected dbConnector: DbConnectorInstance<TAnitaUniversalDataStorage>,
    protected section: keyof AbstractModel,
    protected elements: Array<Partial<E>> | Partial<E>
  ) { }

  protected async save (): Promise<void> {
    this.setSectionStore()
    if (this.elements instanceof Array) {
      for (const element of this.elements) {
        this.processElement(element)
      }
    } else {
      this.processElement(this.elements)
    }
    await new ProjectFileHandleSaver(this.dbConnector).save()
  }

  /**
   * Sets an ampty array is the project did not have one already
   */
  private setSectionStore (): void {
    if (!this.dbConnector.dbStore.db[this.section]) {
      this.dbConnector.dbStore.db[this.section] = []
    }
  }

  private processElement (element: Partial<E>): void {
    this.element = element
    this.checkIfElementInStoreAndSetIndex()
    this.addToStore()
  }

  /**
   * Sets the index of the element being saved if it was already in the store, else assigns the lenght of the array to push it at the end.
   *
   * @remarks The index is used by `addToStore` to replace the existing element with the new one when in edit mode.
   */
  protected checkIfElementInStoreAndSetIndex (): void {
    const elements = this.dbConnector.dbStore.db[this.section] as Array<ISectionElement>
    const check = elements.findIndex(ele => this.element[this.dbConnector.DS[this.section].pk as keyof E] === ele[this.dbConnector.DS[this.section].pk])
    this.index = (check >= 0) ? check : elements.length
  }

  /**
   * Adds the element to the end of the store if it's a new element, otherwise replaces the existing element.
   */
  private addToStore (): void {
    this.dbConnector.dbStore.db[this.section][this.index] = this.element as unknown as ISectionElement
  }
}
