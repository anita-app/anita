import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { ProjectLoadedFooter } from 'app/components/projects/project-card-components/project-loaded-footer.component'
import { ProjectNotLoadedFooter } from 'app/components/projects/project-card-components/project-not-loaded-footer.component'
import { DeleteProjectButton } from 'app/components/shared-components/buttons/delete-project.component'
import * as dateFormat from 'date-format'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectCardProps {
  project: IProjectSettings
}

export const ProjectCard: FC<IProjectCardProps> = (props) => {
  const projectState = useAtomValue(ProjectAtoms.currentSystemData)

  return (
    <div className=" mt-4 h-full border-2 border-gray-200 border-opacity-60 rounded-lg bg-white">
      <div className="p-6">
        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{props.project.title}</h1>
        <p className="text-lg mb-3">{props.project.description}</p>

        <p className="text-gray-600 text-xs">Created on:</p>
        <p className="text-md">{dateFormat('yyyy/MM/dd, at hh:mm', new Date(props.project.createdAt))}</p>
        <CardFooter>
          <DeleteProjectButton project={props.project} />
          <div className="ml-auto">
            {(
              projectState === null ||
            projectState[RESERVED_AUDS_KEYS._settings][0].id !== props.project.id ||
            dbInstances[props.project.id] === undefined
            )
              ? <ProjectNotLoadedFooter project={props.project} />
              : <ProjectLoadedFooter project={props.project} />}
          </div>
        </CardFooter>

      </div>
    </div>
  )
}
