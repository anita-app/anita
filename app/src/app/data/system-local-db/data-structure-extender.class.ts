import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { SezBuilder } from 'app/libs/db-connector/db-builder/sez-builder.class'
import { SectionDefinition, SectionModel } from 'app/libs/db-connector/db-builder/sez-definition'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'

/**
 * Converts the abstract definition of a Section into a complete datastructure that can be processed by FormDataParserService
 *
 * @see FormDataParserService
 */
export class DataStructureExtender {
  /**
   * Temporarly stores all the sections defined by `buildSectionDefinition`
   *
   * @see buildSectionDefinition
   */
  public allSez: Array<SectionDefinition<ISectionElement>> = []

  private datastructure: AbstractModel = {}

  constructor (
    private sections: Array<ISection>
  ) { }

  /**
   * First calls `cleanDataStructure` if a previous project was set.
   * Then builds all sections definitions with `buildSectionDefinition`.
   * Finally calls `buildAndAddAllSections` to build the full section and add it to the datastructure.
   */
  public extend (): AbstractModel {
    this.sections.forEach(section => this.buildSectionDefinition(section))
    this.allSez.forEach(sezDefinition => this.buildAndAddAllSections(sezDefinition))
    return this.datastructure
  }

  /**
   * Builds a contant with the specifications of a Section starting from the structure defined by the user.
   */
  private buildSectionDefinition (section: ISection): void {
    const sezDefinition: SectionDefinition<ISectionElement> = {
      name: section.id,
      fields: Object.values(RESERVED_FIELDS),
      jsonFields: [RESERVED_FIELDS.parentsInfo]
    }
    section.formModel.forEach(field => {
      sezDefinition.fields!.push(field.fieldName)
    })

    this.allSez.push(sezDefinition)
  }

  /**
   * Starting from the definition of the Section, builds a full model of the Section and adds it to the datastructure.
   */
  private buildAndAddAllSections (sezDefinition: SectionDefinition<ISectionElement>): void {
    const sez = new SezBuilder<ISectionElement>(
      this.allSez,
      sezDefinition.name,
      sezDefinition.fields
    ).make()
    this.addToTempTs(sez)
  }

  /**
   * Creates a new key on the datastructure and sets on it the model of the section.
   */
  private addToTempTs (sez: SectionModel<ISectionElement>): void {
    this.datastructure[sez.name] = sez
  }
}
