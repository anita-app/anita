import { dbInstances } from '@anita/client/data/db-instances.const';
import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { RESERVED_UDS_KEYS, SectionElement, SystemData } from '@anita/client/data/model/project-info';
import { SectionModel } from '@anita/client/libs/db-connector/db-builder/sez-definition';
import { IdCreator } from '@anita/client/libs/id-creator/id-creator.class';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';

/**
 * Saves a new element in a section of the project, stores the project on disk and dispatches the changes to the current state
 */
export class ElementSaver {

  /**
   * Reference to section model in DS for easier access in code
   */
  private sectionModelInDS: SectionModel<SectionElement>;

  /**
   * Creates an instance of element saver.
   * @param projectData the unmodified project data
   * @param sectionId the id of the section of the element to save
   * @param element the element to save
   */
  constructor(
    private projectId: string,
    private sectionId: string,
    private element: SectionElement,
    private mode: EDITOR_MODE
  ) { }

  /**
   * Deep clones the project, adds/updated the element in the project to save and finally save the project
   */
  public async save(): Promise<SectionElement> {
    this.setSectionModel();
    this.checkAndSetPk();
    this.setDateCreation();

    if (this.mode === EDITOR_MODE.add)
      await dbInstances[this.projectId].callInsertor(this.sectionId, this.element).autoInsert();
    else {
      this.setLastModifiedValueIfInEditMode();
      await dbInstances[this.projectId].callUpdator(this.sectionId, this.element).autoUpdate();
    }

    return this.element;

  }

  /**
   * Sets the section model from the DS stored in DbConnector
   */
  private setSectionModel(): void {
    this.sectionModelInDS = dbInstances[this.projectId].DS[this.sectionId];
  }

  /**
   * Checks if a `pk` value is set, if not one is created.
   */
  private checkAndSetPk(): void {
    if (!this.element[this.sectionModelInDS.pk])
      this.element[this.sectionModelInDS.pk] = IdCreator.make(this.sectionModelInDS.name);
  }

  /**
   * Checks if `dateCreation` value is set, if not one is created.
   */
  private setDateCreation(): void {
    if (this.sectionModelInDS.fields.includes(RESERVED_FIELDS.dateCreation) && !this.element[RESERVED_FIELDS.dateCreation])
      this.element[RESERVED_FIELDS.dateCreation] = new Date(new Date().toUTCString()).toISOString();
  }

  /**
   * Sets the lastModified value if in edit mode
   */
  private setLastModifiedValueIfInEditMode(): void {
    if (this.sectionModelInDS.fields.includes(RESERVED_FIELDS.lastModified))
      this.element[RESERVED_FIELDS.lastModified] = new Date(new Date().toUTCString()).toISOString();
  }

}
