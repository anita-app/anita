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

/**
 * @feature project.list
 * @title See and open your projects
 * @summary The list of the projects saved on this device, with where each one is stored and the actions on it.
 * @where "Projects" screen ("On this device"), one card per project.
 * @usage 1. Open the Projects screen.
 * 2. On the card of a project click "Load project".
 * 3. Click "Open project" to go to its details, or use "Export" and "Edit Project" on the card.
 * @options Buttons of the screen: "Storage and sync" (connect Dropbox or WordPress sites), "Open from Dropbox", "Import" and
 * "New project". Buttons of each card: "Delete Project", "Load project", then "Export", "Edit Project" and "Open project".
 * @rules Each card shows the avatar, name and description of the project, its creation date and where it is synced: "Synced
 * with Dropbox", "Synced with" and the name of the WordPress site, or the warning "Only on this device, no backup · Keep
 * it safe", which opens the dialog to save the project in Dropbox or on a WordPress site. "Export", "Edit Project" and
 * "Open project" appear once the project is loaded. When there are no projects the app shows the first project page.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectsList
 * @related project.first-project, project.create, project.delete, export.project, import.file
 */
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
