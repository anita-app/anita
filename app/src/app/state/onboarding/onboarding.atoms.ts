import { atom } from 'jotai'

export class OnboardingAtoms {
  /** Project for which the "Save to WordPress" dialog is open, if any. */
  public static storeOnWordPressProjectId = atom<string | null>(null)
  /** Time of the last full export of each project, by project id. */
  public static lastBackups = atom<Record<string, string>>({})
  /** Projects whose "only on this device" banner was closed in this session. */
  public static dismissedLocalOnlyBanners = atom<Array<string>>([])
}
