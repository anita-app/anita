import { Manager } from 'app/cross-refs-exports'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectNotLoadedFooterProps {
  project: IProjectSettings
}

export const ProjectNotLoadedFooter: FC<IProjectNotLoadedFooterProps> = (props) => (
  <Button
    id="loadProject"
    label="Load project"
    onClick={() => Manager.loadProjectById(props.project.id)}
    type={Type.primary}
    fill="outline"
    marginClassName=""
  />
)
