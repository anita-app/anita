import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { Comparator } from 'app/models/project/syncing/project-comparator'

interface IComparatorWorkerPayload {
  lastSync: string | undefined
  localData: TAnitaUniversalDataStorage
  remoteData: TAnitaUniversalDataStorage
}

self.onmessage = async (event: MessageEvent<IComparatorWorkerPayload>) => {
  const { lastSync, localData, remoteData } = event.data
  const comparisonResult = new Comparator(lastSync, localData, remoteData).compare()
  self.postMessage(comparisonResult)
}
