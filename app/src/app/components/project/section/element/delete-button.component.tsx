import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import React from 'react'
import { useNavigate } from 'react-router'
import ReactTooltip from 'react-tooltip'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

interface IProjectSectionElementDeleteButtonProps {
  projectId: string
  sectionId: string
  elementId: string
}

export const ProjectSectionElementDeleteButton: React.FC<IProjectSectionElementDeleteButtonProps> = ({ projectId, sectionId, elementId }) => {
  const { showModal } = useModalContext()

  const navigate = useNavigate()

  const handleClickDelete = () => {
    dbInstances[projectId].callDeletor(sectionId, { id: elementId }).autoDelete()
    navigate(urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }]))
  }

  const handleClickModal = () => {
    showModal({
      title: 'Delete element',
      actionText: 'Delete',
      type: Type.danger,
      handleClickAction: handleClickDelete,
      icon: 'warningOutline',
      iconClassName: 'text-red-600',
      children: (
        <>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this element?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </>
      )
    })
  }

  return (
    <Button
      id="deleteElement"
      label="Delete"
      iconLeft="trashOutline"
      type={Type.danger}
      fill="outline"
      onClick={handleClickModal}
      breakpoint="lg"
      hasTooltip={true}
      marginClassName="mt-6"
    />
  )
}
