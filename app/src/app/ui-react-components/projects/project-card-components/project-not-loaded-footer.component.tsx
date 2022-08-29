import { IProjectSettings } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { Button } from 'app/ui-react-components/shared-components/common-ui-eles/button.component'
import React from 'react'

interface IProjectNotLoadedFooterProps {
  project: IProjectSettings
}

export const ProjectNotLoadedFooter: React.FC<IProjectNotLoadedFooterProps> = ({ project }) => (
  <Button
    id="loadProject"
    label="Load project"
    onClick={() => Manager.loadProjectById(project.id)}
    type="success"
    marginClassName=''
  />
)
