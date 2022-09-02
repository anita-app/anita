import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/manager/Manager.class'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Modal } from 'app/components/shared-components/modals/modal.component'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'

interface IDeleteProjectButtonProps {
  project: IProjectSettings
}

export const DeleteProjectButton: React.FC<IDeleteProjectButtonProps> = ({ project }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [animationClass, setAnimationClass] = useState('animate__fadeIn')
  const navigate = useNavigate()

  const handleClickModal = () => {
    if (isModalOpen) {
      setAnimationClass('animate__fadeOut')
      setTimeout(() => setIsModalOpen(false), 500)
    } else {
      setAnimationClass('animate__fadeIn')
      setIsModalOpen(true)
    }
  }

  const handleClickDelete = () => {
    handleClickModal()
    if (Manager.getCurrentProject()?.getId() === project.id) {
      storeDispatcher({ type: REDUX_ACTIONS.resetCurrentProject })
    }
    // This timeout must be equal or greater than the one in closeFn.
    // Otherwise we would cause an update on an unmounted component.
    setTimeout(async () => {
      (await Manager.getProjectById(project.id, true))!.delete()
      navigate(ANITA_URLS.projectsList)
    }, 500)
  }

  return (
    <span>
      <Button
        id="deleteProject"
        label="Delete Project"
        icon="trashOutline"
        onClick={handleClickModal}
        breakpoint={'lg'}
        type="danger"
        hasTooltip={true}
      />
      {isModalOpen && (
        <Modal
          title="Delete Project"
          actionText="Delete"
          type="alert"
          handleClickAction={handleClickDelete}
          closeFn={handleClickModal}
          animationClass={animationClass}
          icon="warningOutline"
          iconClassName="text-red-600"
        >
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this project?<br /><br />All project data will be permanently removed from this device. This action cannot be undone.<br /><br />Data stored on other devices will not be affected.
          </p>

        </Modal>
      )}
    </span>
  )
}
