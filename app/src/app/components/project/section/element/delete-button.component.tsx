import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { ModalState } from 'app/state/modal/modal-state.class'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { FC } from 'react'

interface IProjectSectionElementDeleteButtonProps {
  projectId: string
  sectionId: string
  elementId: string
}

export const ProjectSectionElementDeleteButton: FC<IProjectSectionElementDeleteButtonProps> = (props) => {
  const handleClickDelete = () => {
    Bucket.general.get(ProjectAtoms.currentProject)?.getSectionById(props.sectionId)?.deleteElement({ [RESERVED_FIELDS.id]: props.elementId })
    RoutingState.goTo(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: props.projectId }, { name: URL_PARAMS.sectionId, value: props.sectionId }])
  }

  const handleClickModal = () => {
    ModalState.showModal({
      title: 'Delete element',
      type: Type.danger,
      ctas: [{
        actionText: 'Delete',
        handleClickAction: handleClickDelete,
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
      ),
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
