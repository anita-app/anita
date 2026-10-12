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
 * Chooses the WordPress site a project is stored on (`remoteStorage`) and who can see it there (`remoteAccessLevel`).
 */
export const RemoteSelector: FC<ICommonFormEleProps<IBasicSelect<ISectionElement>>> = memo(function RemoteSelector ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<ISectionElement>>) {
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)
  const currentRemoteId = (element[formEle.fieldName] as string | undefined) || ''
  const accessLevel = ((element as { remoteAccessLevel?: TAccessLevel }).remoteAccessLevel) ?? DEFAULT_ACCESS_LEVEL
  // The remote the project had when the form was opened: changing it is linking or unlinking.
  const { current: initialRemoteId } = useRef(currentRemoteId)

  const options: Array<ISelectOption> = [
    LOCAL_ONLY,
    ...remotes
      .filter(remote => canCreateProjects(remote) || remote.remoteId === currentRemoteId)
      .map(remote => ({ label: remote.data.site_name || remote.remoteId, value: remote.remoteId })),
  ]
  const selectedOption = options.find(option => option.value === currentRemoteId) ?? { label: currentRemoteId, value: currentRemoteId }
  const selectedRemote = remotes.find(remote => remote.remoteId === currentRemoteId)
  const initialRemoteName = remotes.find(remote => remote.remoteId === initialRemoteId)?.data.site_name ?? initialRemoteId

  const handleRemoteChange = (newValue: SingleValue<ISelectOption>) => {
    const value = newValue?.value ?? ''
    if (initialRemoteId && value !== initialRemoteId) {
      ModalState.showModal({
        title: `Stop syncing with ${initialRemoteName}?`,
        children: (
          <p className="text-sm text-gray-500">
            When you save, this project will stop syncing with {initialRemoteName}. The project is not deleted: it stays on this device and on {initialRemoteName}.
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
    if (value && !(element as { remoteAccessLevel?: TAccessLevel }).remoteAccessLevel) {
      handleChange('remoteAccessLevel', DEFAULT_ACCESS_LEVEL)
    }
  }

  const handleAccessLevelChange = (newValue: SingleValue<ISelectOption<TAccessLevel>>) => {
    handleChange('remoteAccessLevel', newValue?.value ?? DEFAULT_ACCESS_LEVEL)
  }

  if (remotes.length === 0 && !currentRemoteId) {
    return (
      <FormEleContainer width="w-full">
        <FormElementLabel
          label={formEle.label!}
          labelHint={formEle.labelHint}
        />
        <div className="rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="grow">This project is saved on this device only. Connect a WordPress site to store it there and share it with the users of the site.</p>
          <Button
            id="connectWordPressFromForm"
            label="Connect WordPress"
            iconLeft="logoWordpress"
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
        {!!currentRemoteId && currentRemoteId !== initialRemoteId && (
          <p className="text-xs text-gray-500 mt-1">
            When you save, this project will be uploaded to {selectedRemote?.data.site_name ?? currentRemoteId}, and the projects you can access there will be downloaded to this device.
          </p>
        )}
      </FormEleContainer>
      {!!currentRemoteId && (
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
  (prevProps.element as { remoteAccessLevel?: string }).remoteAccessLevel === (nextProps.element as { remoteAccessLevel?: string }).remoteAccessLevel
))
