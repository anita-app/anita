import { ANITA_URLS } from 'app/anita-routes/anita-routes.constant'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { Modal } from 'app/ui-react-components/shared-components/modals/modal.component'
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
    if (Manager.getCurrentProject().getId() === project.id) {
      storeDispatcher({ type: REDUX_ACTIONS.resetCurrentProject })
    }
    // This timeout must be equal or greater than the one in closeFn.
    // Otherwise we would cause an update on an unmounted component.
    setTimeout(() => {
      Manager.getCurrentProject().delete()
      navigate(ANITA_URLS.projectsList)
    }, 500)
  }

  return (
    <span>
      <button onClick={handleClickModal} className="px-4 py-2 text-red-700 inline-flex items-center rounded bg-red-700 bg-opacity-10 hover:bg-opacity-20 text-sm">
        <i className="bi-trash"></i><span className="ml-2 hidden lg:inline-block">Delete project</span>
      </button>
      {isModalOpen && (
        <Modal
          title="Delete Project"
          actionText="Delete"
          type="alert"
          handleClickAction={handleClickDelete}
          closeFn={handleClickModal}
          animationClass={animationClass}
          icon="text-red-600 bi-exclamation-triangle"
        >
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this project?<br /><br />All project data will be permanently removed from this device. This action cannot be undone.<br /><br />Data stored on other devices will not be affected.
          </p>

        </Modal>
      )}
    </span>
  )
}
