import { BehaviorSubject } from 'rxjs'

export const IS_SYNCING = new BehaviorSubject<boolean>(false)

export const IS_SAVING_IN_FS = new BehaviorSubject<boolean>(false)

export const LAST_SYNCED_ID = new BehaviorSubject<string | null>(null)
