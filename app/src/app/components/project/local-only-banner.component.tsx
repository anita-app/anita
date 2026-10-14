import { useAtomValue } from 'jotai'
import * as dateFormat from 'date-format'
import { Icons } from 'app/libs/icons/icons.class'
import { ExportScope } from 'app/models/project/project-exporter.class'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { OnboardingAtoms } from 'app/state/onboarding/onboarding.atoms'
import { OnboardingState } from 'app/state/onboarding/onboarding-state.class'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import type { FC } from 'react'

/**
 * Whether the current project exists only on this device: not on WordPress, not linked to a Dropbox file.
 */
export const useCurrentProjectIsLocalOnly = (): boolean => {
  const systemData = useAtomValue(ProjectAtoms.currentSystemData)
  const project = useAtomValue(ProjectAtoms.currentProject)
  const settings = systemData?.[RESERVED_AUDS_KEYS._settings]?.[0]
  if (!settings?.id || settings.remoteStorage) {
    return false
  }
  const dropbox = project?.getId() === settings.id ? project.dropBoxSyncInfo : undefined
  return !(dropbox?.getLinkedFileId() && dropbox.getCloudSyncState() === CloudSyncState.LINKED)
}

export const formatBackupDate = (isoDate: string | null): string => (isoDate ? dateFormat('yyyy/MM/dd, at hh:mm', new Date(isoDate)) : 'never')

/**
 * Warning shown above every page of a project saved only on this device. Closing it hides it until the app is reopened.
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
              onClick={() => OnboardingState.openStoreOnWordPress(projectId)}
              className="ui-btn inline-flex items-center gap-2 rounded-[10px] bg-linear-to-b from-orange-500 to-orange-600 text-white text-sm font-semibold px-3 py-2 shadow-[0_6px_14px_-6px_rgba(234,88,12,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] hover:to-orange-700"
            >
              {Icons.render('logoWordpress')} Save it on WordPress
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
      onClick={() => OnboardingState.openStoreOnWordPress(project.getId())}
      title="This project is saved only on this device. Click to keep it safe on WordPress."
      className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 text-orange-800 text-xs font-semibold px-2.5 py-1 mr-2 transition hover:bg-orange-100 hover:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]"
    >
      <span className="text-base sm:hidden">{Icons.render('warningOutline')}</span>
      <span className="ui-dot hidden sm:block" />
      <span className="hidden sm:inline">Only on this device</span>
    </button>
  )
}
