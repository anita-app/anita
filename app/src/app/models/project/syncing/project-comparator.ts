import { DateTools } from 'app/libs/tools/date-tools.class'
import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'

interface IComparisonResult {
  remote: IElesForScope
  local: IElesForScope
}

interface IElesForScope {
  delete: Partial<TAnitaUniversalDataStorage>
  insert: Partial<TAnitaUniversalDataStorage>
  update: Partial<TAnitaUniversalDataStorage>
}

export class Comparator {
  private elesFor: IComparisonResult = {
    remote: {
      delete: {},
      insert: {},
      update: {}
    },
    local: {
      delete: {},
      insert: {},
      update: {}
    }
  }

  private localElementsMerged: { [key: keyof TAnitaUniversalDataStorage]: Array<string> } = {}

  constructor (
    private lastSync: string,
    private localData: TAnitaUniversalDataStorage,
    private remoteData: TAnitaUniversalDataStorage
  ) { }

  public compare (): IComparisonResult {
    for (const section in this.remoteData) {
      this.handleSection(section)
    }
    this.handleAllLocalElements()
    return this.elesFor
  }

  private handleSection (section: keyof TAnitaUniversalDataStorage): void {
    this.localElementsMerged[section] = []
    const pkKey = RESERVED_FIELDS.id
    if (this.remoteData[section] && this.remoteData[section].length > 0) {
      for (let remElesCounter = 0, remElesLen = this.remoteData[section].length; remElesCounter < remElesLen; remElesCounter++) {
        try {
          const element = this.localData[section].find((ele) => ele[pkKey] === this.remoteData[section][remElesCounter][pkKey])
          if (element) {
            this.toDoIfLocalElementExistsOrNot(remElesCounter, section, element)
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  private toDoIfLocalElementExistsOrNot (remElesCounter: number, section: keyof TAnitaUniversalDataStorage, localElement: ISectionElement): void {
    if (localElement) {
      this.checkWhatToUpdate(section, localElement, remElesCounter)
    } else {
      this.checkIfInsertOrDelete(section, remElesCounter)
    }
  }

  /**
   * @method checkWhatToUpdate
   * @description The element exist both online and locally
   *              Here we need to determine which one has been edited for last, if updatedAt is different
   *              Either we update the local one, or store in a temp var the value to push it to the db
   *              after we drop the localelement from the localElementsList, to see what's left at the end
   */
  private checkWhatToUpdate (section: keyof TAnitaUniversalDataStorage, localElement: ISectionElement, remElesCounter: number): void {
    const pkKey = RESERVED_FIELDS.id
    const remoteElement = this.remoteData[section][remElesCounter]
    if (!DateTools.areEqual(remoteElement[RESERVED_FIELDS.updatedAt], localElement[RESERVED_FIELDS.updatedAt])) {
      const target = DateTools.firstIsAfterSecond(remoteElement[RESERVED_FIELDS.updatedAt], localElement[RESERVED_FIELDS.updatedAt]) ? 'local' : 'remote'
      this.addElesForScope(target, 'update', section, localElement)
    }
    if (localElement[pkKey]) {
      this.addToLocalElementsMerged(section, localElement)
    }
  }

  /**
   * @method checkIfInsertOrDelete
   * @description The element exist only online
   *              Here we need to determine if the elements has been added online, or removed from the app
   *              If the updatedAt is after the lastSync, or the lastSync is null, the element has to be added locally
   *              otherwise, the element has to be deleted from the remote db
   */
  private checkIfInsertOrDelete (section: keyof TAnitaUniversalDataStorage, remElesCounter: number): void {
    const pkKey = RESERVED_FIELDS.id
    const dateCompareField = RESERVED_FIELDS.updatedAt
    const target = DateTools.firstIsAfterSecond(this.remoteData[section][remElesCounter][dateCompareField], this.lastSync) || !this.lastSync ? 'local' : 'remote'
    this.addElesForScope(target, 'insert', section, this.remoteData[section][remElesCounter])
    if (this.remoteData[section][remElesCounter][pkKey]) {
      this.addToLocalElementsMerged(section, this.remoteData[section][remElesCounter])
    }
  }

  private handleAllLocalElements (): void {
    for (const section in this.remoteData) {
      this.handleLocalElements(section)
    }
  }

  private handleLocalElements (section: keyof TAnitaUniversalDataStorage): void {
    const pkKey = RESERVED_FIELDS.id

    if (this.localElementsMerged[section].length) {
      const elements = this.localData[section].filter((ele) => ele[pkKey] && !this.localElementsMerged[section].includes(ele[pkKey]))
      this.elesInLocalDbOnly(section, elements)
    }
  }

  private elesInLocalDbOnly (section: keyof TAnitaUniversalDataStorage, localElementsList: ISectionElement): void {
    const dateCompareField = RESERVED_FIELDS.updatedAt
    if (localElementsList) {
      /* Here we analyze the remaining local elements (if any)
       * If the updatedAt is after the lastSync, or the lastSync is null, the element has to be pushed to the remote db
       * otherwise, the element has to be deleted from the local db
       */
      for (let remoteElesOnlyCounter = 0, remoteElesOnlyLen = localElementsList.length; remoteElesOnlyCounter < remoteElesOnlyLen; remoteElesOnlyCounter++) {
        const target = (DateTools.firstIsAfterSecond(localElementsList[remoteElesOnlyCounter][dateCompareField], this.lastSync) || !this.lastSync) ? 'remote' : 'local'
        this.addElesForScope(target, 'delete', section, localElementsList[remoteElesOnlyCounter])
      }
    }
  }

  private addToLocalElementsMerged (section: keyof TAnitaUniversalDataStorage, element: ISectionElement): void {
    const pkKey = RESERVED_FIELDS.id
    if (element[pkKey]) {
      this.localElementsMerged[section].push(element[pkKey])
    }
  }

  private addElesForScope (target: 'remote' | 'local', action: 'delete' | 'insert' | 'update', section: keyof TAnitaUniversalDataStorage, localElement: ISectionElement): void {
    if (!this.elesFor[target][action]) {
      this.elesFor[target][action] = {}
    }
    if (!this.elesFor[target][action]) {
      this.elesFor[target][action] = {}
    }
    if (!this.elesFor[target][action][section]) {
      this.elesFor[target][action][section] = []
    }
    this.elesFor[target][action][section]!.push(localElement)
  }
}
