import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import type { ISection } from 'app/models/section/section.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

export class Queriers {
  public static async getElement<T extends ISectionElement> (db: string, table: string, elementId: string): Promise<T | null | void> {
    if (!db || !table || !elementId) {
      return null
    }
    return dbInstances[db].callSelector<T>(table, { [RESERVED_FIELDS.id]: elementId } as Partial<T>).single()
  }

  public static async getElements<T extends ISectionElement> (db: string, table: string): Promise<Array<T> | null> {
    if (!db || !table) {
      return null
    }
    return dbInstances[db].callSelector<T>(table).multiple()
  }

  public static getProjectSection (projectId: string, sectionId: string): Promise<ISection | void | null> {
    return this.getElement(projectId, RESERVED_AUDS_KEYS._sections, sectionId)
  }
}
