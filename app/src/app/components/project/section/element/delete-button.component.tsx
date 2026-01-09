import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Manager } from 'app/cross-refs-exports'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { ModalState } from 'app/state/modal/modal-state.class'

interface IProjectSectionElementDeleteButtonProps {
  projectId: string
  sectionId: string
  elementId: string
}

export const ProjectSectionElementDeleteButton: React.FC<IProjectSectionElementDeleteButtonProps> = ({ projectId, sectionId, elementId }) => {
  const navigate = useNavigate()

  const handleClickDelete = () => {
    Manager.getCurrentProject()?.getSectionById(sectionId)?.deleteElement({ [RESERVED_FIELDS.id]: elementId })
    navigate(urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }]))
  }

  const handleClickModal = () => {
    ModalState.showModal({
      title: 'Delete element',
      type: Type.danger,
      ctas: [{
        actionText: 'Delete',
        handleClickAction: handleClickDelete
      }],
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
