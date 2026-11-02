import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Icons } from 'app/libs/icons/icons.class'
import { memo, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { Select } from 'app/components/shared-components/common-ui-eles/select.component'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ModalState } from 'app/state/modal/modal-state.class'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { ACCESS_LEVEL_LABELS, DEFAULT_ACCESS_LEVEL, WORD_PRESS_ROLE_WEIGHT } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import { DROPBOX_PROJECTS_FOLDER, DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { displayDropboxFolder } from 'app/libs/cloud-sync/dropbox/dropbox-files.function'
import { dropboxAccountLabel } from 'app/components/remotes/dropbox-icon.component'
import { DropboxFolderField } from 'app/components/remotes/dropbox-picker.component'
import { LOCAL_FILE_REMOTE_ID, isLocalFileSyncSupported } from 'app/libs/cloud-sync/local-file/local-file.const'
import { LocalFileHelper } from 'app/libs/cloud-sync/local-file/local-file-helper.class'
import { LocalFileSync } from 'app/libs/cloud-sync/local-file/local-file-sync.class'
import { getLocalFileErrorMessage } from 'app/libs/cloud-sync/local-file/local-file-error.class'
import type { FC, ReactNode } from 'react'
import type { SingleValue } from 'react-select'
import type { IBasicSelect, ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { IWordPressRemoteInfo, TAccessLevel } from 'app/libs/cloud-sync/wordpress/wordpress.const'

interface ISelectOption<T extends string = string> {
  label: string
  value: T
}

const LOCAL_ONLY: ISelectOption = { label: 'None: this device only', value: '' }

const canCreateProjects = (remote: IWordPressRemoteInfo): boolean => (
  remote.data.can_create_projects ?? WORD_PRESS_ROLE_WEIGHT[remote.data.user_role] >= WORD_PRESS_ROLE_WEIGHT[remote.data.can_create_projects_role]
)

const accessLevelOptions: Array<ISelectOption<TAccessLevel>> = (Object.keys(ACCESS_LEVEL_LABELS) as Array<TAccessLevel>).map(level => ({
  label: ACCESS_LEVEL_LABELS[level],
  value: level,
}))

/** Small box under the field, explaining how the chosen storage works. */
const StorageInfo: FC<{ children: ReactNode }> = (props) => (
  <div className="mt-2 flex gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs leading-relaxed text-prussian-blue-400">
    <span className="shrink-0 text-sm text-prussian-blue-500">{Icons.render('informationCircleOutline')}</span>
    <p>{props.children}</p>
  </div>
)

/**
 * Chooses where a project is stored besides this device (`remoteStorage`): Dropbox, a WordPress site or a file on this
 * computer, and who can see it on the site (`remoteAccessLevel`).
 * @featurePart storage.choice, sync.wordpress-share, sync.local-file-projects
 */
export const RemoteSelector: FC<ICommonFormEleProps<IBasicSelect<ISectionElement>>> = memo(function RemoteSelector ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<ISectionElement>>) {
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)
  const dropboxAccount = useAtomValue(SyncStateAtoms.dropboxAccount)
  const dropboxLinks = useAtomValue(SyncStateAtoms.dropboxLinks)
  const dropboxFolder = (element as { dropboxFolder?: string }).dropboxFolder || DROPBOX_PROJECTS_FOLDER
  const projectId = (element as { id?: string }).id ?? ''
  const linkedFile = dropboxLinks[projectId]
  const localFileLink = useAtomValue(SyncStateAtoms.localFileLinks)[projectId]
  // The file the project is imported from, already chosen by the user: offered without asking for a file again.
  const { current: offeredFile } = useRef(LocalFileSync.getPendingFile(projectId))
  const [pendingFileName, setPendingFileName] = useState(() => offeredFile?.name)
  const [fileError, setFileError] = useState<string | null>(null)
  const localFileSupported = isLocalFileSyncSupported()
  const currentRemoteId = (element[formEle.fieldName] as string | undefined) || ''
  const accessLevel = ((element as { remoteAccessLevel?: TAccessLevel }).remoteAccessLevel) ?? DEFAULT_ACCESS_LEVEL
  // The remote the project had when the form was opened: changing it is linking or unlinking. The file offered on
  // import is not linked yet.
  const { current: initialRemoteId } = useRef(currentRemoteId === LOCAL_FILE_REMOTE_ID && offeredFile ? '' : currentRemoteId)

  const remoteName = (remoteId: string): string => {
    if (remoteId === DROPBOX_REMOTE_ID) {
      return 'Dropbox'
    }
    if (remoteId === LOCAL_FILE_REMOTE_ID) {
      return localFileLink?.name ?? 'the file'
    }
    return remotes.find(remote => remote.remoteId === remoteId)?.data.site_name ?? remoteId
  }
  const isWordPressSite = !!currentRemoteId && currentRemoteId !== DROPBOX_REMOTE_ID && currentRemoteId !== LOCAL_FILE_REMOTE_ID
  const localFileName = pendingFileName ?? offeredFile?.name ?? (initialRemoteId === LOCAL_FILE_REMOTE_ID ? localFileLink?.name : undefined)

  const options: Array<ISelectOption> = [
    LOCAL_ONLY,
    ...(dropboxAccount || currentRemoteId === DROPBOX_REMOTE_ID ? [{ label: dropboxAccount ? `Dropbox (${dropboxAccountLabel(dropboxAccount)})` : 'Dropbox', value: DROPBOX_REMOTE_ID }] : []),
    ...remotes
      .filter(remote => canCreateProjects(remote) || remote.remoteId === currentRemoteId)
      .map(remote => ({ label: remote.data.site_name || remote.remoteId, value: remote.remoteId })),
    ...(localFileSupported || currentRemoteId === LOCAL_FILE_REMOTE_ID
      ? [{ label: `A file on this computer${localFileName ? ` (${localFileName})` : ''}`, value: LOCAL_FILE_REMOTE_ID }]
      : []),
  ]
  const selectedOption = options.find(option => option.value === currentRemoteId) ?? { label: currentRemoteId, value: currentRemoteId }
  const initialRemoteName = remoteName(initialRemoteId)
  const initialIsDropbox = initialRemoteId === DROPBOX_REMOTE_ID
  const initialIsLocalFile = initialRemoteId === LOCAL_FILE_REMOTE_ID

  /**
   * A new file is chosen when the option is selected, as browsers open the "Save" dialog only after a click. On
   * import, the imported file is used instead.
   */
  const applyRemoteChange = async (value: string) => {
    setFileError(null)
    if (value === LOCAL_FILE_REMOTE_ID && value !== initialRemoteId) {
      let handle: FileSystemFileHandle | null = offeredFile ?? null
      try {
        handle ??= await LocalFileHelper.pickNewFile((element as { title?: string }).title)
      } catch (error) {
        setFileError(getLocalFileErrorMessage(error))
        return
      }
      if (!handle) {
        return
      }
      LocalFileSync.setPendingFile(projectId, handle)
      setPendingFileName(handle.name)
    } else {
      LocalFileSync.setPendingFile(projectId, undefined)
      setPendingFileName(undefined)
    }
    handleChange(formEle.fieldName, value)
    if (value !== DROPBOX_REMOTE_ID && (element as { dropboxFolder?: string }).dropboxFolder) {
      handleChange('dropboxFolder', '')
    }
    if (value && value !== DROPBOX_REMOTE_ID && value !== LOCAL_FILE_REMOTE_ID && !(element as { remoteAccessLevel?: TAccessLevel }).remoteAccessLevel) {
      handleChange('remoteAccessLevel', DEFAULT_ACCESS_LEVEL)
    }
  }

  const handleRemoteChange = (newValue: SingleValue<ISelectOption>) => {
    const value = newValue?.value ?? ''
    if (initialRemoteId && value !== initialRemoteId) {
      ModalState.showModal({
        title: `Stop syncing with ${initialRemoteName}?`,
        children: (
          <p className="text-sm text-gray-500">
            When you save, this project will stop syncing with {initialRemoteName}. The project is not deleted: it stays on this device and {initialIsDropbox ? 'in your Dropbox' : (initialIsLocalFile ? 'in the file on your computer' : `on ${initialRemoteName}`)}.
          </p>
        ),
        ctas: [{
          actionText: 'Stop syncing',
          handleClickAction: () => {
            applyRemoteChange(value)
          },
        }],
      })
      return
    }
    applyRemoteChange(value)
  }

  const handleAccessLevelChange = (newValue: SingleValue<ISelectOption<TAccessLevel>>) => {
    handleChange('remoteAccessLevel', newValue?.value ?? DEFAULT_ACCESS_LEVEL)
  }

  /** How the chosen storage works, as the hint of the field only names the choices. */
  const storageInfo = () => {
    const isChanging = currentRemoteId !== initialRemoteId
    if (currentRemoteId === DROPBOX_REMOTE_ID) {
      return (
        <>
          Saved in your Dropbox{linkedFile?.path && !isChanging ? <> as <strong>{linkedFile.path}</strong></> : <>, in <strong>{displayDropboxFolder(dropboxFolder)}</strong></>}, and synced on every device where you connect the same Dropbox account.
          {isChanging && <> When you save, the projects of the {DROPBOX_PROJECTS_FOLDER} folder are also downloaded to this device.</>}
        </>
      )
    }
    if (currentRemoteId === LOCAL_FILE_REMOTE_ID) {
      return (
        <>
          Saved also in {localFileName ? <strong>{localFileName}</strong> : 'a file'} on this computer, and kept in sync both ways: your changes are written in the file, and changes made to the file, also by hand, are read by Anita. Your browser asks your permission to use the file, and asks again in each new visit. The project is available only on this computer.
        </>
      )
    }
    if (isWordPressSite) {
      return (
        <>
          Saved on <strong>{remoteName(currentRemoteId)}</strong>, and synced on every device where you connect the site. The users of the site chosen in &quot;Visible to&quot; can see it and edit its records.
          {isChanging && <> When you save, the projects you can access there are also downloaded to this device.</>}
        </>
      )
    }
    return (
      <>
        The project is saved only in this browser{offeredFile ? <>: changes are not written in <strong>{offeredFile.name}</strong></> : ''}. Clearing the browsing data or losing this device deletes it. To keep it safe and use it on all your devices, choose Dropbox or a WordPress site{remotes.length === 0 && !dropboxAccount ? ' (connect them in Storage and sync)' : ''}{localFileSupported ? ', or keep it in sync with a file on this computer' : ''}.
      </>
    )
  }

  if (remotes.length === 0 && !dropboxAccount && !currentRemoteId && !localFileSupported) {
    return (
      <FormEleContainer width="w-full">
        <FormElementLabel
          label={formEle.label!}
          labelHint={formEle.labelHint}
        />
        <div className="rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="grow">This project is saved on this device only. Connect Dropbox to keep it on all your devices, or a WordPress site to also share it with the users of the site.</p>
          <Button
            id="connectStorageFromForm"
            label="Connect storage"
            iconLeft="cloudUploadOutline"
            type={Type.secondary}
            size="sm"
            href={ANITA_URLS.remotes}
            marginClassName=""
          />
        </div>
      </FormEleContainer>
    )
  }

  const selectedLevel = accessLevelOptions.find(option => option.value === accessLevel) ?? accessLevelOptions[0]

  return (
    <>
      <FormEleContainer width="w-full">
        <FormElementLabel
          label={formEle.label!}
          labelHint={formEle.labelHint}
        />
        <Select
          inputId="remoteStorage"
          value={selectedOption}
          name={formEle.fieldName}
          options={options}
          isSearchable={false}
          onChange={handleRemoteChange}
        />
        {currentRemoteId === DROPBOX_REMOTE_ID && currentRemoteId !== initialRemoteId && !!dropboxAccount && !dropboxAccount.needsReauth && (
          <div className="mt-2">
            <DropboxFolderField
              value={dropboxFolder}
              onChange={(folder) => handleChange('dropboxFolder', folder === DROPBOX_PROJECTS_FOLDER ? '' : folder)}
            />
          </div>
        )}
        <StorageInfo>{storageInfo()}</StorageInfo>
        {fileError && <p className="text-xs text-orange-700 mt-1">{fileError}</p>}
      </FormEleContainer>
      {isWordPressSite && (
        <FormEleContainer width="w-full">
          <FormElementLabel
            label="Visible to"
            labelHint="Users of the WordPress site who can see this project and edit its records. Only you and the administrators of the site can change its structure or delete it."
          />
          <Select
            inputId="remoteAccessLevel"
            value={selectedLevel}
            name="remoteAccessLevel"
            options={accessLevelOptions}
            isSearchable={false}
            onChange={handleAccessLevelChange}
          />
        </FormEleContainer>
      )}
    </>
  )
}, (prevProps, nextProps) => (
  prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
  (prevProps.element as { remoteAccessLevel?: string }).remoteAccessLevel === (nextProps.element as { remoteAccessLevel?: string }).remoteAccessLevel &&
  (prevProps.element as { dropboxFolder?: string }).dropboxFolder === (nextProps.element as { dropboxFolder?: string }).dropboxFolder
))
