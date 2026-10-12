import { Comparator } from 'app/models/project/syncing/project-comparator'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

interface IComparatorWorkerPayload {
  id: number
  lastSync: string | undefined
  localData: TAnitaUniversalDataStorage
  remoteData: TAnitaUniversalDataStorage
}

self.onmessage = async (event: MessageEvent<IComparatorWorkerPayload>) => {
  const { id, lastSync, localData, remoteData } = event.data
  try {
    const result = new Comparator(lastSync, localData, remoteData).compare()
    self.postMessage({ id, result })
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) })
  }
}
