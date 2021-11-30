import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { SezBuilder } from 'app/libs/db-connector/db-builder/sez-builder.class';
import { SectionDefinition, SectionModel } from 'app/libs/db-connector/db-builder/sez-definition';

/**
 * Builds the data structure of the DB from the section definitions and returns it.
 */
export class DataStructureBuilder {

  /**
   * The data structure to be returned.
   */
  private ds: AbstractModel = {};

  /**
   * Creates an instance of DataStructureBuilder.
   * @param allSez the `Array` of all the definitions of the Sections (aka tables) of the DB.
   */
  constructor(
    private allSez: Array<SectionDefinition<any>>
  ) { }

  /**
   * Loops all Sections and finally returns the data structure.
   */
  public make(): AbstractModel {
    this.allSez.forEach(sez => this.buildSez<typeof sez>(sez));
    return this.ds;
  }

  /**
   * Builds the actual Section to be added to data structure.
   */
  private buildSez<T>(sezParams: SectionDefinition<T>): void {
    const sez = new SezBuilder<T>(
      this.allSez,
      sezParams.name,
      sezParams.fields,
      sezParams.jsonFields,
      sezParams.pk,
      sezParams.indexes,
      sezParams.orderBy,
      sezParams.childOf,
      sezParams.parentsIdentifiers,
      sezParams.ownerIdentifier
    ).make();
    this.addToTempDs(sez);
  }

  /**
   * Adds a Section to the class property `ds` using `name` as key.
   */
  private addToTempDs<T>(sez: SectionModel<T>): void {
    this.ds[sez.name] = sez;
  }

}
