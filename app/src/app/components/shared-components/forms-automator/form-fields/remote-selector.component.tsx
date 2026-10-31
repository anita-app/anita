import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { memo, useRef } from 'react'
import { useAtomValue } from 'jotai'
import Select from 'react-select'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ModalState } from 'app/state/modal/modal-state.class'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { ACCESS_LEVEL_LABELS, DEFAULT_ACCESS_LEVEL, WORD_PRESS_ROLE_WEIGHT } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import { DROPBOX_PROJECTS_FOLDER, DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { displayDropboxFolder } from 'app/libs/cloud-sync/dropbox/dropbox-files.function'
import { dropboxAccountLabel } from 'app/components/remotes/dropbox-icon.component'
import { DropboxFolderField } from 'app/components/remotes/dropbox-picker.component'
import type { FC } from 'react'
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

/**
 * Chooses where a project is stored besides this device (`remoteStorage`): Dropbox or a WordPress site, and who can
 * see it on the site (`remoteAccessLevel`).
 */
export const RemoteSelector: FC<ICommonFormEleProps<IBasicSelect<ISectionElement>>> = memo(function RemoteSelector ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<ISectionElement>>) {
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)
  const dropboxAccount = useAtomValue(SyncStateAtoms.dropboxAccount)
  const dropboxLinks = useAtomValue(SyncStateAtoms.dropboxLinks)
  const dropboxFolder = (element as { dropboxFolder?: string }).dropboxFolder || DROPBOX_PROJECTS_FOLDER
  const linkedFile = dropboxLinks[(element as { id?: string }).id ?? '']
  const currentRemoteId = (element[formEle.fieldName] as string | undefined) || ''
  const accessLevel = ((element as { remoteAccessLevel?: TAccessLevel }).remoteAccessLevel) ?? DEFAULT_ACCESS_LEVEL
  // The remote the project had when the form was opened: changing it is linking or unlinking.
  const { current: initialRemoteId } = useRef(currentRemoteId)

  const remoteName = (remoteId: string): string => (
    remoteId === DROPBOX_REMOTE_ID ? 'Dropbox' : (remotes.find(remote => remote.remoteId === remoteId)?.data.site_name ?? remoteId)
  )
  const isWordPressSite = !!currentRemoteId && currentRemoteId !== DROPBOX_REMOTE_ID

  const options: Array<ISelectOption> = [
    LOCAL_ONLY,
    ...(dropboxAccount || currentRemoteId === DROPBOX_REMOTE_ID ? [{ label: dropboxAccount ? `Dropbox (${dropboxAccountLabel(dropboxAccount)})` : 'Dropbox', value: DROPBOX_REMOTE_ID }] : []),
    ...remotes
      .filter(remote => canCreateProjects(remote) || remote.remoteId === currentRemoteId)
      .map(remote => ({ label: remote.data.site_name || remote.remoteId, value: remote.remoteId })),
  ]
  const selectedOption = options.find(option => option.value === currentRemoteId) ?? { label: currentRemoteId, value: currentRemoteId }
  const initialRemoteName = remoteName(initialRemoteId)
  const initialIsDropbox = initialRemoteId === DROPBOX_REMOTE_ID

  const handleRemoteChange = (newValue: SingleValue<ISelectOption>) => {
    const value = newValue?.value ?? ''
    if (initialRemoteId && value !== initialRemoteId) {
      ModalState.showModal({
        title: `Stop syncing with ${initialRemoteName}?`,
        children: (
          <p className="text-sm text-gray-500">
            When you save, this project will stop syncing with {initialRemoteName}. The project is not deleted: it stays on this device and {initialIsDropbox ? 'in your Dropbox' : `on ${initialRemoteName}`}.
          </p>
        ),
        ctas: [{
          actionText: 'Stop syncing',
          handleClickAction: () => handleChange(formEle.fieldName, value),
        }],
      })
      return
    }
    handleChange(formEle.fieldName, value)
    if (value !== DROPBOX_REMOTE_ID && (element as { dropboxFolder?: string }).dropboxFolder) {
      handleChange('dropboxFolder', '')
    }
    if (value && value !== DROPBOX_REMOTE_ID && !(element as { remoteAccessLevel?: TAccessLevel }).remoteAccessLevel) {
      handleChange('remoteAccessLevel', DEFAULT_ACCESS_LEVEL)
    }
  }

  const handleAccessLevelChange = (newValue: SingleValue<ISelectOption<TAccessLevel>>) => {
    handleChange('remoteAccessLevel', newValue?.value ?? DEFAULT_ACCESS_LEVEL)
  }

  if (remotes.length === 0 && !dropboxAccount && !currentRemoteId) {
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
        {currentRemoteId === DROPBOX_REMOTE_ID && currentRemoteId !== initialRemoteId && (
          <>
            {!!dropboxAccount && !dropboxAccount.needsReauth && (
              <div className="mt-2">
                <DropboxFolderField
                  value={dropboxFolder}
                  onChange={(folder) => handleChange('dropboxFolder', folder === DROPBOX_PROJECTS_FOLDER ? '' : folder)}
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              When you save, this project will be saved in {displayDropboxFolder(dropboxFolder)} in your Dropbox, and the projects of the {DROPBOX_PROJECTS_FOLDER} folder will be downloaded to this device.
            </p>
          </>
        )}
        {currentRemoteId === DROPBOX_REMOTE_ID && initialRemoteId === DROPBOX_REMOTE_ID && linkedFile?.path && (
          <p className="text-xs text-gray-500 mt-1">Synced with {linkedFile.path}</p>
        )}
        {isWordPressSite && currentRemoteId !== initialRemoteId && (
          <p className="text-xs text-gray-500 mt-1">
            When you save, this project will be uploaded to {remoteName(currentRemoteId)}, and the projects you can access there will be downloaded to this device.
          </p>
        )}
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
