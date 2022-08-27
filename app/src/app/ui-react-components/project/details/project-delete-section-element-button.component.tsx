import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { DANGER_BTN_OUTLINE } from 'app/ui-react-components/shared-components/buttons/buttons-layout-tw-classes.const';
import { Modal } from 'app/ui-react-components/shared-components/modals/modal.component';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import ReactTooltip from 'react-tooltip';

export const ProjectDeleteSectionElementButton = ({ projectId, sectionId, elementId }: { projectId: string, sectionId: string, elementId: string }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate__fadeIn');

  const navigate = useNavigate();

  const handleClickModal = () => {
    if (isModalOpen) {
      setAnimationClass('animate__fadeOut')
      setTimeout(() => setIsModalOpen(false), 500);
    } else {
      setAnimationClass('animate__fadeIn')
      setIsModalOpen(true)
    }
  }

  const handleClickDelete = () => {
    handleClickModal();
    // This timeout must be equal or greater than the one in closeFn.
    // Otherwise we would cause an update on an unmounted component.
    setTimeout(() => {
      dbInstances[projectId].callDeletor(sectionId, { id: elementId }).autoDelete();
      navigate(urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }]));
    }, 500);
  }

  return (
    <span>
      <button data-tip data-for="deleteElement" onClick={handleClickModal} className={`${DANGER_BTN_OUTLINE} mt-6 px-4 py-2`}>
        <i className="bi-trash"></i>
      </button>
      <ReactTooltip id="deleteElement" effect="solid">Delete element</ReactTooltip>
      {isModalOpen && <Modal
        title="Delete element"
        actionText="Delete"
        type="alert"
        handleClickAction={handleClickDelete}
        closeFn={handleClickModal}
        animationClass={animationClass}
        icon="text-red-600 bi-exclamation-triangle"
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this element?
        </p>
        <p className="text-sm text-gray-500">
          This action cannot be undone.
        </p>

      </Modal>
      }
    </span>
  )
}
