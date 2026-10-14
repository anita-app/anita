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
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div className="ui-rise">
          <p className="ui-eyebrow">On this device</p>
          <h1 className="ui-title text-2xl">Projects</h1>
        </div>
        <div className="flex shrink-0">
          <Button
            id="wordpressSites"
            label="WordPress sites"
            href={ANITA_URLS.remotes}
            iconLeft="logoWordpress"
            tooltip="Connect and manage WordPress sites"
            breakpoint="md"
            type={Type.secondary}
            size="sm"
          />
          <ImportProjectButton btnType="compact" />
          <Button
            id="createProject"
            label="New project"
            href={ANITA_URLS.projectNew}
            iconLeft="addOutline"
            tooltip="Create a new project"
            breakpoint="sm"
            type={Type.primary}
            size="sm"
            marginClassName=""
          />
        </div>
      </div>
      <div className="grid gap-4">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
