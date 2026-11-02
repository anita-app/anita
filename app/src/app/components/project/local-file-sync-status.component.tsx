import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { useLiveQuery } from 'dexie-react-hooks'
import dateFormat from 'date-format'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { Icons } from 'app/libs/icons/icons.class'
import { CloudSyncBase } from 'app/cross-refs-exports'
import { LocalFileSync } from 'app/libs/cloud-sync/local-file/local-file-sync.class'
import { getLocalFileErrorMessage } from 'app/libs/cloud-sync/local-file/local-file-error.class'
import { isLocalFileSyncSupported } from 'app/libs/cloud-sync/local-file/local-file.const'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

const formatDate = (isoDate: string): string => dateFormat('yyyy/MM/dd, at hh:mm', new Date(isoDate))

/** Runs an action started by a click, showing its error (if any) without throwing. */
const useFileAction = (): [boolean, string | null, (action: () => Promise<unknown>) => void] => {
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = (action: () => Promise<unknown>) => {
    setError(null)
    setIsWorking(true)
    action()
      .catch(actionError => setError(getLocalFileErrorMessage(actionError)))
      .finally(() => setIsWorking(false))
  }
  return [isWorking, error, run]
}

/**
 * Sync information and actions for a project synced with a file on this computer.
 * @featurePart sync.local-file-projects, sync.local-file-access, sync.status
 */
export const LocalFileSyncStatus: FC<{ project: IProjectSettings }> = (props) => {
  const project = props.project
  const link = useAtomValue(SyncStateAtoms.localFileLinks)[project.id]
  const status = useAtomValue(SyncStateAtoms.projectsStatus)[project.id]
  const lastSync = useLiveQuery(() => CloudSyncBase.getLastSync(project.id), [project.id, status?.lastSync])
  const [isWorking, actionError, run] = useFileAction()
  const supported = isLocalFileSyncSupported()
  const needsFile = supported && (!link || status?.needsAccess === 'file')
  const needsPermission = supported && !needsFile && status?.needsAccess === 'permission'

  return (
    <div className="mb-3 space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="ui-field">
          <p className="ui-field-label">Remote storage</p>
          <p className="ui-field-value">A file on this computer</p>
        </div>
        <div className="ui-field">
          <p className="ui-field-label">File</p>
          <p className="ui-field-value break-all">{link?.name ?? 'Not chosen in this browser'}</p>
        </div>
      </div>

      <div className="ui-field flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="ui-field-label">Last sync</p>
          <p className="ui-field-value">
            {status?.isSyncing ? 'Syncing…' : ((status?.lastSync ?? lastSync) ? formatDate((status?.lastSync ?? lastSync)!) : 'Not synced yet')}
            {!status?.isSyncing && status?.pendingChanges && ' · some changes are not saved in the file yet'}
          </p>
        </div>
        {supported && link && !needsFile && !needsPermission && (
          <Button
            id="syncProjectNow"
            label={status?.isSyncing ? 'Syncing' : 'Sync now'}
            iconLeft="sync"
            iconLeftClassName={status?.isSyncing ? 'animate-spin' : ''}
            type={Type.secondary}
            size="sm"
            disabled={status?.isSyncing}
            onClick={() => LocalFileSync.syncProject(project.id)}
          />
        )}
      </div>

      {!supported && (
        <AlertWithDescription
          title="This browser cannot use files on your computer"
          description="Open Anita in Chrome, Edge or another Chromium-based browser on a computer to sync this project with its file. Until then, changes are saved in this browser only."
          type={Type.warning}
        />
      )}

      {needsPermission && (
        <div>
          <AlertWithDescription
            title={`Allow Anita to open ${link?.name ?? 'the file'}`}
            description="Your browser asks your permission before Anita can read and write the file. Choose “Allow on every visit” if your browser offers it. Until then, changes are kept in this browser."
            type={Type.warning}
          />
          <Button
            id="allowLocalFileAccess"
            label={isWorking ? 'Waiting…' : 'Allow access'}
            iconLeft="lockOpenOutline"
            type={Type.primary}
            disabled={isWorking}
            onClick={() => run(() => LocalFileSync.requestAccess(project.id))}
            marginClassName="mt-2"
          />
        </div>
      )}

      {needsFile && (
        <AlertWithDescription
          title={link ? `${link.name} was not found` : 'Choose the file of this project'}
          description={link
            ? 'The file may have been moved, renamed or deleted. Choose it again, or save the project in a new file. Your changes are kept in this browser.'
            : 'This browser does not know which file this project is synced with. Choose the file, or save the project in a new file. Your changes are kept in this browser.'}
          type={Type.warning}
        />
      )}

      {supported && (
        <div className="flex flex-wrap gap-2">
          <Button
            id="chooseLocalFile"
            label="Choose the file"
            iconLeft="folderOpenOutline"
            type={needsFile ? Type.primary : Type.secondary}
            size="sm"
            disabled={isWorking}
            onClick={() => run(() => LocalFileSync.chooseExistingFile(project.id))}
            marginClassName=""
          />
          <Button
            id="saveInNewLocalFile"
            label="Save in a new file"
            iconLeft="saveOutline"
            type={Type.secondary}
            size="sm"
            disabled={isWorking}
            onClick={() => run(() => LocalFileSync.saveInNewFile(project.id, project.title))}
            marginClassName=""
          />
        </div>
      )}

      {actionError && (
        <AlertWithDescription
          title="The file was not linked"
          description={actionError}
          type={Type.warning}
        />
      )}
      {!actionError && !needsPermission && status?.error && (
        <AlertWithDescription
          title="Sync problem"
          description={status.error}
          type={Type.warning}
        />
      )}
      {!status?.error && status?.notice && (
        <AlertWithDescription
          title="Synced"
          description={status.notice}
          type={Type.secondary}
        />
      )}
    </div>
  )
}

/**
 * Banner at the top of the pages of a project whose file needs the permission of the user in this visit.
 * @featurePart sync.local-file-access
 */
export const LocalFileAccessBanner: FC = () => {
  const systemData = useAtomValue(ProjectAtoms.currentSystemData)
  const settings = systemData?.[RESERVED_AUDS_KEYS._settings]?.[0]
  const status = useAtomValue(SyncStateAtoms.projectsStatus)[settings?.id ?? '']
  const link = useAtomValue(SyncStateAtoms.localFileLinks)[settings?.id ?? '']
  const [isWorking, , run] = useFileAction()

  if (!settings || !LocalFileSync.isLocalFileProject(settings) || !link || status?.needsAccess !== 'permission') {
    return null
  }

  return (
    <div
      role="alert"
      className="ui-rise mb-4 p-4 rounded-xl border border-[#cfe3fb] bg-[#f4f8fe]"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[#2d96ff] text-xl">{Icons.render('lockClosedOutline')}</span>
        <div className="grow min-w-0">
          <p className="font-bold text-[#0b1f36] break-words">Anita needs your permission to open {link.name}</p>
          <p className="text-sm text-[#5b6b80] mt-1">Your changes are kept in this browser and will be saved in the file once you allow it.</p>
        </div>
        <Button
          id="allowLocalFileAccessBanner"
          label={isWorking ? 'Waiting…' : 'Allow access'}
          iconLeft="lockOpenOutline"
          type={Type.primary}
          size="sm"
          disabled={isWorking}
          onClick={() => run(() => LocalFileSync.requestAccess(settings.id))}
          marginClassName=""
        />
      </div>
    </div>
  )
}
