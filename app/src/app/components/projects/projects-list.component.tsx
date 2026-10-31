import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ProjectCard } from 'app/components/projects/project-card.component'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { OpenFromDropboxButton } from 'app/components/remotes/open-from-dropbox-button.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Navigate } from 'react-router-dom'
import { PageHeader } from 'app/components/shared-components/common-ui-eles/page-header.component'
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
      <PageHeader
        eyebrow="On this device"
        title="Projects"
        actions={(
          <>
            <Button
              id="storageAndSync"
              label="Storage and sync"
              href={ANITA_URLS.remotes}
              iconLeft="cloudUploadOutline"
              tooltip="Connect Dropbox or WordPress sites"
              breakpoint="md"
              type={Type.secondary}
              size="sm"
            />
            <OpenFromDropboxButton breakpoint="lg" />
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
          </>
        )}
      />
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
