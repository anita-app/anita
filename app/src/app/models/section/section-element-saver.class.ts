import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { IdCreator } from 'app/libs/id-creator/id-creator.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { DateTools } from 'app/libs/tools/date-tools.class'

/**
 * Saves a new element in a section of the project, stores the project on disk and dispatches the changes to the current state
 */
export class SectionElementSaver {
  /**
   * Creates an instance of element saver.
   * @param projectData the unmodified project data
   * @param sectionId the id of the section of the element to save
   * @param element the element to save
   */
  constructor (
    private projectId: string,
    private sectionId: string,
    private element: ISectionElement,
    private mode: EDITOR_MODE
  ) { }

  /**
   * Deep clones the project, adds/updated the element in the project to save and finally save the project
   */
  public async save (): Promise<ISectionElement> {
    this.checkAndSetPk()
    this.setcreatedAt()
    this.deleteEmptyProps()

    if (this.mode === EDITOR_MODE.add) {
      await dbInstances[this.projectId].callInsertor(this.sectionId, this.element).autoInsert()
    } else {
      this.setupdatedAtValueIfInEditMode()
      await dbInstances[this.projectId].callUpdator(this.sectionId, this.element).autoUpdate()
    }

    return this.element
  }

  /**
   * Checks if the `id` is set, if not one is created.
   */
  private checkAndSetPk (): void {
    if (!this.element[RESERVED_FIELDS.id]) {
      const elementValues = Object.values(this.element)
      this.element[RESERVED_FIELDS.id] = IdCreator.make(elementValues.join('-'))
    }
  }

  /**
   * Deletes all props from the element whose value is an empty string
   */
  private deleteEmptyProps (): void {
    for (const prop in this.element) {
      if (this.element[prop] === '') {
        delete this.element[prop]
      }
    }
  }

  /**
   * Checks if `createdAt` value is set, if not one is created.
   */
  private setcreatedAt (): void {
    if (!this.element[RESERVED_FIELDS.createdAt]) {
      this.element[RESERVED_FIELDS.createdAt] = DateTools.getUtcIsoString()
    }
  }

  /**
   * Sets the updatedAt value if in edit mode
   */
  private setupdatedAtValueIfInEditMode (): void {
    this.element[RESERVED_FIELDS.updatedAt] = DateTools.getUtcIsoString()
  }
}
