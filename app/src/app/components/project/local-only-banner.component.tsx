import { useAtomValue } from 'jotai'
import dateFormat from 'date-format'
import { Icons } from 'app/libs/icons/icons.class'
import { ExportScope } from 'app/models/project/project-exporter.class'
import { OnboardingAtoms } from 'app/state/onboarding/onboarding.atoms'
import { OnboardingState } from 'app/state/onboarding/onboarding-state.class'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import type { FC } from 'react'

/**
 * Whether the current project exists only on this device: not synced with WordPress or Dropbox.
 * @featurePart storage.local-only
 */
export const useCurrentProjectIsLocalOnly = (): boolean => {
  const systemData = useAtomValue(ProjectAtoms.currentSystemData)
  const settings = systemData?.[RESERVED_AUDS_KEYS._settings]?.[0]
  return !!settings?.id && !settings.remoteStorage
}

/** @featurePart storage.local-only */
export const formatBackupDate = (isoDate: string | null): string => (isoDate ? dateFormat('yyyy/MM/dd, at hh:mm', new Date(isoDate)) : 'never')

/**
 * Warning shown above every page of a project saved only on this device. Closing it hides it until the app is reopened.
 *
 * @feature storage.local-only
 * @title Warning for projects saved only on this device
 * @summary Reminds you that a project not stored in Dropbox or on WordPress exists only in this browser, and offers to save it safely or download a backup.
 * @where Orange banner "This project is saved only on this device" at the top of every page of the project; badge "Only on this device" in the header; badge "Only on this device, no backup · Keep it safe" on the project card in the list of projects.
 * @usage Click "Save it in Dropbox or WordPress" (or the header badge) to choose where to keep the project, or "Download a backup" to save a copy of the whole project as a file. Close the banner with the × button.
 * @options none
 * @rules The banner shows the date of the last backup ("never" if none). Closing it hides it for that project until the app is reopened; the header badge stays visible. The banner disappears once the project is stored in Dropbox or on a WordPress site.
 * @errors none
 * @status beta
 * @since 1.0.0
 * @related storage.choice
 */
export const LocalOnlyBanner: FC = () => {
  const isLocalOnly = useCurrentProjectIsLocalOnly()
  const project = useAtomValue(ProjectAtoms.currentProject)
  const dismissed = useAtomValue(OnboardingAtoms.dismissedLocalOnlyBanners)
  const lastBackups = useAtomValue(OnboardingAtoms.lastBackups)

  if (!isLocalOnly || !project || dismissed.includes(project.getId())) {
    return null
  }

  const projectId = project.getId()
  const lastBackup = OnboardingState.getLastBackup(projectId, lastBackups)

  return (
    <div
      role="alert"
      className="ui-banner ui-rise mb-4 p-4"
    >
      <div className="flex gap-3">
        <span className="ui-banner-icon">{Icons.render('warningOutline')}</span>
        <div className="grow min-w-0">
          <p className="font-bold text-orange-900">This project is saved only on this device</p>
          <p className="text-sm text-orange-800 mt-1">
            It lives in this browser&apos;s storage: clearing browsing data, using private browsing, or losing or replacing this device deletes it for good.
            {' '}
            Last backup: <strong>{formatBackupDate(lastBackup)}</strong>.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => OnboardingState.openStoreProject(projectId)}
              className="ui-btn inline-flex items-center gap-2 rounded-[10px] bg-linear-to-b from-orange-500 to-orange-600 text-white text-sm font-semibold px-3 py-2 shadow-[0_6px_14px_-6px_rgba(234,88,12,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] hover:to-orange-700"
            >
              {Icons.render('cloudUploadOutline')} Save it in Dropbox or WordPress
            </button>
            <button
              type="button"
              onClick={() => project.export(ExportScope.all)}
              className="ui-btn inline-flex items-center gap-2 rounded-[10px] border border-orange-200 bg-white text-orange-800 text-sm font-semibold px-3 py-2 hover:bg-orange-50"
            >
              {Icons.render('cloudDownloadOutline')} Download a backup
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Hide until the app is reopened"
          title="Hide until the app is reopened"
          onClick={() => OnboardingState.dismissLocalOnlyBanner(projectId)}
          className="self-start w-7 h-7 rounded-lg grid place-items-center text-orange-700 hover:text-orange-900 hover:bg-orange-500/10"
        >
          {Icons.render('closeOutline')}
        </button>
      </div>
    </div>
  )
}

/**
 * Header indicator for a project saved only on this device. Always visible, also after the banner is closed.
 * @featurePart storage.local-only
 */
export const LocalOnlyHeaderButton: FC = () => {
  const isLocalOnly = useCurrentProjectIsLocalOnly()
  const project = useAtomValue(ProjectAtoms.currentProject)
  if (!isLocalOnly || !project) {
    return null
  }
  return (
    <button
      type="button"
      onClick={() => OnboardingState.openStoreProject(project.getId())}
      title="This project is saved only on this device. Click to keep it safe in Dropbox or on WordPress."
      className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 text-orange-800 text-xs font-semibold px-2.5 py-1 mr-2 transition hover:bg-orange-100 hover:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]"
    >
      <span className="text-base sm:hidden">{Icons.render('warningOutline')}</span>
      <span className="ui-dot hidden sm:block" />
      <span className="hidden sm:inline">Only on this device</span>
    </button>
  )
}
