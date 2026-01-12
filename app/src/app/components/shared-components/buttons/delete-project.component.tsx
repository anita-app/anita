import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import { ProjectDeletor } from 'app/models/project/project-deletor.class'
import { ProjectState } from 'app/state/project/project-state.class'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IDeleteProjectButtonProps {
  project: IProjectSettings
}

export const DeleteProjectButton: FC<IDeleteProjectButtonProps> = (props) => {
  const handleClickDelete = async () => {
    if (Bucket.general.get(ProjectAtoms.currentProject)?.getId() === props.project.id) {
      ProjectState.resetCurrentProject()
    }
    new ProjectDeletor(props.project.id).delete()
    RoutingState.goTo(ANITA_URLS.projectsList)
  }

  const handleClickModal = () => {
    ModalState.showModal({
      title: 'Delete Project',
      type: Type.danger,
      ctas: [{
        actionText: 'Delete',
        handleClickAction: handleClickDelete,
      }],
      children: (
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this project?<br /><br />All project data will be permanently removed from this device. This action cannot be undone.<br /><br />Data stored on other devices will not be affected.
        </p>
      ),
    })
  }

  if (props.project.remoteStorage && !WordpressHelper.instance.canDeleteProject(props.project.remoteStorage)) {
    return null
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
