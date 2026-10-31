import { atom } from 'jotai'

export class OnboardingAtoms {
  /** Project for which the dialog to save it in Dropbox or on WordPress is open, if any. */
  public static storeProjectId = atom<string | null>(null)
  /** Time of the last full export of each project, by project id. */
  public static lastBackups = atom<Record<string, string>>({})
  /** Projects whose "only on this device" banner was closed in this session. */
  public static dismissedLocalOnlyBanners = atom<Array<string>>([])
}
