import { Bucket } from 'app/state/bucket.state'
import { OnboardingAtoms } from 'app/state/onboarding/onboarding.atoms'
import { DateTools } from 'app/libs/tools/date-tools.class'

const BACKUP_KEY_PREFIX = 'anita.lastBackup.'

export class OnboardingState {
  public static openStoreOnWordPress = (projectId: string) => {
    Bucket.general.set(OnboardingAtoms.storeOnWordPressProjectId, projectId)
  }

  public static closeStoreOnWordPress = () => {
    Bucket.general.set(OnboardingAtoms.storeOnWordPressProjectId, null)
  }

  /**
   * Remembers that a full copy of the project was downloaded.
   */
  public static markBackedUp = (projectId: string) => {
    const now = DateTools.getUtcIsoString()
    try {
      localStorage.setItem(BACKUP_KEY_PREFIX + projectId, now)
    } catch {
      // Storage disabled: kept for this session only.
    }
    Bucket.general.set(OnboardingAtoms.lastBackups, { ...Bucket.general.get(OnboardingAtoms.lastBackups), [projectId]: now })
  }

  public static getLastBackup = (projectId: string, lastBackups: Record<string, string>): string | null => {
    if (lastBackups[projectId]) {
      return lastBackups[projectId]
    }
    try {
      return localStorage.getItem(BACKUP_KEY_PREFIX + projectId)
    } catch {
      return null
    }
  }

  public static dismissLocalOnlyBanner = (projectId: string) => {
    Bucket.general.set(OnboardingAtoms.dismissedLocalOnlyBanners, [...Bucket.general.get(OnboardingAtoms.dismissedLocalOnlyBanners), projectId])
  }
}
