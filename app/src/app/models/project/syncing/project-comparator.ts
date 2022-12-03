import { DateTools } from 'app/libs/tools/date-tools.class'
import { RESERVED_AUDS_KEYS, TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'

export interface IComparisonResult {
  remote: IElesForScope
  remoteData: TAnitaUniversalDataStorage
  local: IElesForScope
  localData: TAnitaUniversalDataStorage
}

interface IElesForScope {
  delete: Partial<TAnitaUniversalDataStorage>
  insert: Partial<TAnitaUniversalDataStorage>
  update: Partial<TAnitaUniversalDataStorage>
}

export class Comparator {
  private static nonDeletableSections = Object.values(RESERVED_AUDS_KEYS)
  private delta: IComparisonResult = {
    remote: {
      delete: {},
      insert: {},
      update: {}
    },
    remoteData: {} as TAnitaUniversalDataStorage,
    local: {
      delete: {},
      insert: {},
      update: {}
    },
    localData: {} as TAnitaUniversalDataStorage
  }

  private localElementsMerged: { [key: keyof TAnitaUniversalDataStorage]: Array<string> } = {}

  constructor (
    private lastSync: string | undefined,
    private localData: TAnitaUniversalDataStorage,
    private remoteData: TAnitaUniversalDataStorage
  ) { }

  public compare (): IComparisonResult {
    if (!this.remoteData) {
      this.remoteData = {} as TAnitaUniversalDataStorage
    }
    for (const section in this.remoteData) {
      this.compareSectionStartingFromRemoteElements(section)
    }
    this.handleAllLocalElementsNotInRemote()
    this.delta.remoteData = this.applyDeltaToData('remote', this.remoteData)
    this.delta.localData = this.applyDeltaToData('local', this.localData)
    return this.delta
  }

  private compareSectionStartingFromRemoteElements (section: keyof TAnitaUniversalDataStorage): void {
    this.localElementsMerged[section] = []
    const pkKey = RESERVED_FIELDS.id
    if (this.remoteData[section] && this.remoteData[section].length > 0) {
      for (let remElesCounter = 0, remElesLen = this.remoteData[section].length; remElesCounter < remElesLen; remElesCounter++) {
        try {
          const element = this.localData[section].find((ele) => ele[pkKey] === this.remoteData[section][remElesCounter][pkKey])
          this.toDoIfLocalElementExistsOrNot(remElesCounter, section, element)
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  private toDoIfLocalElementExistsOrNot (remElesCounter: number, section: keyof TAnitaUniversalDataStorage, localElement?: ISectionElement): void {
    if (localElement) {
      this.checkWhatToUpdateBetweenRemoteAndLocalElement(section, localElement, remElesCounter)
    } else {
      this.checkIfShouldInsertRemoteInLocalOrDeleteFromRemote(section, remElesCounter)
    }
  }

  /**
   * @description The element exist both remotely and locally
   *              Here we need to determine which one has been edited for last, if updatedAt is different
   *              Either we update the local one, or store in a temp var the value to push it to the db
   *              after we drop the localelement from the localElementsList, to see what's left at the end
   */
  private checkWhatToUpdateBetweenRemoteAndLocalElement (section: keyof TAnitaUniversalDataStorage, localElement: ISectionElement, remElesCounter: number): void {
    const pkKey = RESERVED_FIELDS.id
    const remoteElement = this.remoteData[section][remElesCounter]
    const dateCompareField = this.getDateCompareField(this.remoteData[section][remElesCounter], localElement)
    if (!DateTools.areEqual(remoteElement[dateCompareField], localElement[dateCompareField])) {
      const target = DateTools.firstIsAfterSecond(remoteElement[dateCompareField], localElement[dateCompareField]) ? 'local' : 'remote'
      const newestElement = target === 'local' ? remoteElement : localElement
      this.addElesForScope(target, 'update', section, newestElement)
    }
    if (localElement[pkKey]) {
      this.addToLocalElementsMerged(section, localElement)
    }
  }

  /**
   * @description The element exist only remotely
   *              Here we need to determine if the elements has been added remotely, or removed locally
   *              If the updatedAt is after the lastSync, or the lastSync is null, the element has to be added locally
   *              otherwise, the element has to be deleted from the remote db
   */
  private checkIfShouldInsertRemoteInLocalOrDeleteFromRemote (section: keyof TAnitaUniversalDataStorage, remElesCounter: number): void {
    const dateCompareField = this.remoteData[section][remElesCounter][RESERVED_FIELDS.updatedAt] ? RESERVED_FIELDS.updatedAt : RESERVED_FIELDS.createdAt
    const target = DateTools.firstIsAfterSecond(this.remoteData[section][remElesCounter][dateCompareField], this.lastSync) || !this.lastSync ? 'local' : 'remote'
    const action = target === 'local' ? 'insert' : 'delete'
    this.addElesForScope(target, action, section, this.remoteData[section][remElesCounter])
    if (target === 'remote') {
      this.addToLocalElementsMerged(section, this.remoteData[section][remElesCounter])
    }
  }

  private handleAllLocalElementsNotInRemote (): void {
    for (const section in this.localData) {
      this.handleLocalElementsNotInRemoteBySection(section)
    }
  }

  private handleLocalElementsNotInRemoteBySection (section: keyof TAnitaUniversalDataStorage): void {
    const pkKey = RESERVED_FIELDS.id
    const localElementsNotProcessedWithRemote = this.localElementsMerged?.[section]?.length
      ? this.localData[section].filter((ele) => ele[pkKey] && !this.localElementsMerged[section].includes(ele[pkKey]))
      : this.localData[section]
    this.shouldElementsOnlyInLocalBeDeletedOrAddedToRemote(section, localElementsNotProcessedWithRemote)
  }

  /**
   * @description Here we analyze the remaining local elements (if any)
   *              If the updatedAt is after the lastSync, or the lastSync is null, the element has to be pushed to the remote db
   *              otherwise, the element has to be deleted from the local db
   */
  private shouldElementsOnlyInLocalBeDeletedOrAddedToRemote (section: keyof TAnitaUniversalDataStorage, localElementsNotProcessedWithRemote: ISectionElement): void {
    if (localElementsNotProcessedWithRemote) {
      for (let localElesOnlyCounter = 0, localElementsOnlyLength = localElementsNotProcessedWithRemote.length; localElesOnlyCounter < localElementsOnlyLength; localElesOnlyCounter++) {
        const dateCompareField = localElementsNotProcessedWithRemote[localElesOnlyCounter][RESERVED_FIELDS.updatedAt] ? RESERVED_FIELDS.updatedAt : RESERVED_FIELDS.createdAt
        const target = (DateTools.firstIsAfterSecond(localElementsNotProcessedWithRemote[localElesOnlyCounter][dateCompareField], this.lastSync) || !this.lastSync) ? 'remote' : 'local'
        const action = target === 'remote' ? 'insert' : 'delete'
        this.addElesForScope(target, action, section, localElementsNotProcessedWithRemote[localElesOnlyCounter])
      }
    }
  }

  private addToLocalElementsMerged (section: keyof TAnitaUniversalDataStorage, element: ISectionElement): void {
    const pkKey = RESERVED_FIELDS.id
    if (element[pkKey]) {
      this.localElementsMerged[section].push(element[pkKey])
    }
  }

  private addElesForScope (target: 'remote' | 'local', action: 'delete' | 'insert' | 'update', section: keyof TAnitaUniversalDataStorage, element: ISectionElement): void {
    if (action === 'delete' && Comparator.nonDeletableSections.includes(section as unknown as RESERVED_AUDS_KEYS)) {
      return
    }
    if (!this.delta[target][action]) {
      this.delta[target][action] = {}
    }
    if (!this.delta[target][action]) {
      this.delta[target][action] = {}
    }
    if (!this.delta[target][action][section]) {
      this.delta[target][action][section] = []
    }
    this.delta[target][action][section]!.push(element)
  }

  private getDateCompareField (remoteElement: ISectionElement, localElement: ISectionElement): string {
    if (remoteElement[RESERVED_FIELDS.updatedAt] || localElement[RESERVED_FIELDS.updatedAt]) {
      return RESERVED_FIELDS.updatedAt
    }
    return RESERVED_FIELDS.createdAt
  }

  private applyDeltaToData (scope: 'local' | 'remote', dataToUpdate: TAnitaUniversalDataStorage): TAnitaUniversalDataStorage {
    for (const action in this.delta[scope]) {
      const actionAsKey = action as keyof IElesForScope
      const deltaRemoteActionData = this.delta[scope][actionAsKey]
      for (const section in deltaRemoteActionData) {
        const sectionAsKey = section as keyof TAnitaUniversalDataStorage
        if (typeof deltaRemoteActionData[sectionAsKey] === 'object') {
          for (const element of deltaRemoteActionData[sectionAsKey]!) {
            if (actionAsKey === 'delete') {
              dataToUpdate[sectionAsKey] = dataToUpdate?.[sectionAsKey]?.filter((ele) => ele[RESERVED_FIELDS.id] !== element[RESERVED_FIELDS.id])
            } else if (actionAsKey === 'insert') {
              if (!dataToUpdate[sectionAsKey]) {
                dataToUpdate[sectionAsKey] = []
              }
              dataToUpdate[sectionAsKey].push(element)
            } else if (actionAsKey === 'update') {
              const indexElement = dataToUpdate[sectionAsKey].findIndex((ele) => ele[RESERVED_FIELDS.id] === element[RESERVED_FIELDS.id])
              if (indexElement !== -1) {
                dataToUpdate[sectionAsKey][indexElement] = element
              }
            }
          }
        }
      }
    }
    return dataToUpdate
  }
}
