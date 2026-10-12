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
      className="mb-4 rounded-lg border border-orange-300 bg-orange-50 p-4"
    >
      <div className="flex gap-3">
        <span className="text-2xl text-orange-600 shrink-0">{Icons.render('warningOutline')}</span>
        <div className="grow min-w-0">
          <p className="font-medium text-orange-900">This project is saved only on this device</p>
          <p className="text-sm text-orange-800 mt-1">
            It lives in this browser&apos;s storage: clearing browsing data, using private browsing, or losing or replacing this device deletes it for good.
            {' '}
            Last backup: <strong>{formatBackupDate(lastBackup)}</strong>.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => OnboardingState.openStoreOnWordPress(projectId)}
              className="inline-flex items-center gap-2 rounded-md bg-orange-600 text-white text-sm font-medium px-3 py-2 hover:bg-orange-700"
            >
              {Icons.render('logoWordpress')} Save it on WordPress
            </button>
            <button
              type="button"
              onClick={() => project.export(ExportScope.all)}
              className="inline-flex items-center gap-2 rounded-md border border-orange-300 bg-white text-orange-800 text-sm font-medium px-3 py-2 hover:bg-orange-100"
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
          className="self-start text-orange-700 hover:text-orange-900"
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
      className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 text-orange-800 text-xs font-medium px-2 py-1 mr-2 hover:bg-orange-100"
    >
      <span className="text-base">{Icons.render('warningOutline')}</span>
      <span className="hidden sm:inline">Only on this device</span>
    </button>
  )
}
