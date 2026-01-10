import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ProjectCard } from 'app/components/projects/project-card.component'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Navigate } from 'react-router-dom'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useAtomValue } from 'jotai'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import type { FC } from 'react'

export const ProjectsList: FC = () => {
  const projects = useAtomValue(ProjectsListAtoms.projects)

  if (Array.isArray(projects) && projects.length === 0) {
    return <Navigate to={ANITA_URLS.projectsNone} />
  }

  return (
    <div>
      <div className="md:w-full bg-white border-b-2 rounded border-white">
        <div className="flex items-center h-full border-t-2 border-prussian-blue-400 border-opacity-60 rounded justify-between">
          <div className="px-6 py-3">
            <h1 className="title-font text-md font-medium text-gray-900">Projects on this device</h1>
          </div>
          <div className="my-2">
            <ImportProjectButton btnType="icon" />
            <Button
              id="createProject"
              label="Create project"
              labelClassName="hidden"
              href={ANITA_URLS.projectAdd}
              iconLeft="addOutline"
              tooltip="Create a new project"
              type={Type.primary}
              size="sm"
            />
          </div>
        </div>
      </div>
      <div className="p-1 md:w-full">
        {projects.map(project => (<ProjectCard
          key={project.id}
          project={project}
                                  />))}
      </div>
    </div>
  )
}
