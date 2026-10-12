import { Comparator } from 'app/models/project/syncing/project-comparator'
import type { IComparisonResult } from 'app/models/project/syncing/project-comparator'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

interface IWorkerResponse {
  id: number
  result?: IComparisonResult
  error?: string
}

/**
 * Runs the comparison between local and remote data in a Web Worker, one promise per request,
 * so that concurrent syncs of different projects never receive each other's results.
 */
export class ComparatorRunner {
  private static worker: Worker | undefined
  private static nextId = 0
  private static pending = new Map<number, { resolve:(result: IComparisonResult) => void; reject: (error: Error) => void }>()

  public static compare (lastSync: string | undefined, localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage): Promise<IComparisonResult> {
    if (typeof Worker === 'undefined') {
      return Promise.resolve(new Comparator(lastSync, JSON.parse(JSON.stringify(localData)), JSON.parse(JSON.stringify(remoteData))).compare())
    }
    const worker = ComparatorRunner.getWorker()
    const id = ++ComparatorRunner.nextId
    return new Promise((resolve, reject) => {
      ComparatorRunner.pending.set(id, { resolve, reject })
      worker.postMessage({ id, lastSync, localData, remoteData })
    })
  }

  private static getWorker (): Worker {
    if (!ComparatorRunner.worker) {
      ComparatorRunner.worker = new Worker(new URL('app/workers/comparator.worker', import.meta.url), { type: 'module' })
      ComparatorRunner.worker.onmessage = (event: MessageEvent<IWorkerResponse>) => {
        const request = ComparatorRunner.pending.get(event.data.id)
        if (!request) {
          return
        }
        ComparatorRunner.pending.delete(event.data.id)
        if (event.data.error || !event.data.result) {
          request.reject(new Error(event.data.error ?? 'Comparison failed'))
        } else {
          request.resolve(event.data.result)
        }
      }
    }
    return ComparatorRunner.worker
  }
}
