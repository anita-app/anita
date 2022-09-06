import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { IProjectSettings } from 'app/models/project/project.declarations'
import { Manager } from 'app/libs/manager-n/manager.class'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import React from 'react'
import { useNavigate } from 'react-router'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

interface IDeleteProjectButtonProps {
  project: IProjectSettings
}

export const DeleteProjectButton: React.FC<IDeleteProjectButtonProps> = ({ project }) => {
  const { showModal } = useModalContext()

  const navigate = useNavigate()

  const handleClickDelete = async () => {
    if (Manager.getCurrentProject()?.getId() === project.id) {
      storeDispatcher({ type: REDUX_ACTIONS.resetCurrentProject })
    }
    // This timeout must be equal or greater than the one in closeFn.
    // Otherwise we would cause an update on an unmounted component.
    (await Manager.getProjectById(project.id, true))!.delete()
    navigate(ANITA_URLS.projectsList)
  }

  const handleClickModal = () => {
    showModal({
      title: 'Delete Project',
      actionText: 'Delete',
      type: Type.danger,
      handleClickAction: handleClickDelete,
      icon: 'warningOutline',
      iconClassName: 'text-red-600',
      children: (
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this project?<br /><br />All project data will be permanently removed from this device. This action cannot be undone.<br /><br />Data stored on other devices will not be affected.
        </p>
      )
    })
  }

  return (
    <Button
      id="deleteProject"
      label="Delete Project"
      iconLeft="trashOutline"
      onClick={handleClickModal}
      breakpoint={'lg'}
      type={Type.danger}
      fill={'outline'}
      hasTooltip={true}
    />
  )
}
