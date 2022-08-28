import { DEFAULT_OWNER_IDENTIFIER, DEFAULT_PARENTS_IDENTIFIER, DEFAULT_PK } from 'app/libs/db-connector/db-builder/default-values.constant';
import { SectionDefinition, SectionModel, SectionName } from 'app/libs/db-connector/db-builder/sez-definition';
import { Logger } from 'app/libs/Logger/logger.class';

/**
 * Builds a Section model
 */
export class SezBuilder<T> {

  /**
   * The section model
   */
  private section: SectionModel<T>;

  /**
   * Creates an instance of sez builder.
   * @param allSez all the sections definitions of the data structure.
   * @param name the section name to build.
   * @param [fields] all fields. Optional as a section can have only the system fields.
   * @param [pk] the primary key.
   * @param [indexes] the indexes of the section (aka table).
   * @param [orderBy] default sorting order.
   * @param [childOf] list of sections of which the current section is child. Needed for the UI, to add the parent delector.
   * @param [parentsIdentifiers] name of the field identifying the parent id value.
   * @param [ownerIdentifier] name of the field identifying the id of the owner.
   */
  constructor(
    private allSez: Array<SectionDefinition<any>>,
    private name: SectionName,
    private fields: Array<keyof T & string> = [],
    private jsonFields: Array<keyof T & string> = [],
    private pk: keyof T & string = DEFAULT_PK as keyof T & string,
    private indexes: Array<keyof T> = [DEFAULT_PK] as Array<keyof T>,
    private orderBy: keyof T & string = DEFAULT_PK as keyof T & string,
    private childOf?: Array<SectionName>,
    private parentsIdentifiers?: keyof T,
    private ownerIdentifier?: keyof T & string
  ) { }

  /**
   * Makes the section and returns it.
   */
  public make(): SectionModel<T> {
    this.addPkToFields();
    this.addPkToIndexes();
    this.addSpecialFieldsToFields('indexes');
    this.addSpecialFieldsToFields('jsonFields');
    this.setOwnerIdentifier();
    this.checkOrderByExists();
    this.checkRelations();
    this.checkParentIdentifier();
    this.buildSez();
    return this.section;
  }

  /**
   * Adds the pk field name to fields if not already included.
   */
  private addPkToFields(): void {
    if (!this.fields.includes(this.pk))
      this.fields.unshift(this.pk);
  }

  /**
   * Adds the pk field name to indexes if not already included.
   */
  private addPkToIndexes(): void {
    if (!this.indexes.includes(this.pk))
      this.indexes.unshift(this.pk);
  }

  /**
   * Adds the fields specified in `indexes` to the fields, if not already included.
   */
  private addSpecialFieldsToFields(scope: 'indexes' | 'jsonFields'): void {
    this[scope].forEach(fieldName => {
      if (!this.fields.includes(fieldName))
        this.fields.push(fieldName);
    });
  }

  /**
   * Sets the owneridentifier value and adds it to the fields if not already included.
   */
  private setOwnerIdentifier(): void {
    if (!this.ownerIdentifier)
      this.ownerIdentifier = DEFAULT_OWNER_IDENTIFIER as keyof T & string;
    if (!this.fields.includes(this.ownerIdentifier))
      this.fields.push(this.ownerIdentifier);
  }

  /**
   * Adds the orderBy value to fields if not already included.
   */
  private checkOrderByExists(): void {
    if (!this.fields.includes(this.orderBy))
      this.fields.push(this.orderBy);
  }

  /**
   * Checks that the values of `childOf` correspond to valid section names.
   */
  private checkRelations(): void {
    if (this.childOf)
      this.loopAllRelations();
  }

  /**
   * Loops all relations for a given scope and calls checkRelationsExist to check if the value is valid.
   * Sets the scope to undefined if there are no valid relationships.
   *
   * @see checkRelationsExist
   */
  private loopAllRelations(): void {
    this.childOf.forEach((sezName: SectionName) => this.checkRelationsExist(sezName));
    if (!this.childOf.length)
      this.childOf = undefined;
  }

  /**
   * Checks that the section name found in `childOf` correponds to an actual section.
   * If not, removes the section name from the list of sections in `childOf`.
   * @param sezName the name of the section to look for
   */
  private checkRelationsExist(sezName: SectionName): void {
    const indexSez = this.getSezByName(sezName);
    if (indexSez >= 0)
      return;

    const indexInScope = this.childOf.indexOf(sezName as string);
    this.childOf.splice(indexInScope, 1);

    Logger.error(`Error in .childOf list`, `Section '${sezName}' does not exist in the sections list and has hence been removed from the .childOf list`);
  }

  /**
   * Finds the section number by its name from the list of all the section definitions.
   * @param sezName the name to look for
   * @returns the section number
   */
  private getSezByName(sezName: SectionName): number {
    let foundIndex = -1;
    let counter = 0;
    const length = this.allSez.length;
    while (foundIndex === -1 && counter < length) {
      if (this.allSez[counter].name === sezName)
        foundIndex = counter;
      counter++;
    }
    return foundIndex;
  }

  /**
   * Checks that parentsIdentifiers is set if `childOf` has any section.
   */
  private checkParentIdentifier(): void {
    if (this.childOf && !this.parentsIdentifiers)
      this.parentsIdentifiers = DEFAULT_PARENTS_IDENTIFIER as keyof T;
  }

  /**
   * Builds the section
   */
  private buildSez(): void {
    this.section = {
      name: this.name,
      pk: this.pk,
      indexes: this.indexes,
      orderBy: this.orderBy,
      fields: this.fields,
      ownerIdentifier: this.ownerIdentifier,
      jsonFields: this.jsonFields
    };
    this.addChildOf();
  }

  /**
   * Adds the filed `childOf` if any
   */
  private addChildOf(): void {
    if (!this.childOf)
      return;

    this.section.childOf = this.childOf;
    this.section.parentsIdentifiers = this.parentsIdentifiers;
  }

}
