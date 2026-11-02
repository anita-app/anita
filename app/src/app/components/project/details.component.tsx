import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Navigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { ProjectDetailsCard } from './details-card'
import type { FC } from 'react'

/**
 * @feature project.info-page
 * @title Project info page
 * @summary Shows the main information of the open project and the buttons to edit, export or delete it.
 * @where Sidebar, project menu at the top: "Details" (or click the current project); on the projects list, "Open project" on a project card. It is also the page that opens after creating, importing or opening a project.
 * @usage Open the project menu in the sidebar and choose "Details". Read the information, then use the buttons at the bottom of the card.
 * @options Buttons at the bottom of the card: "Delete Project", "Export" (Data and Structure, Data Only, Structure Only) and "Edit Project".
 * @rules The card shows the project picture (initials), the word "Project", its title and description, "Created on" (date and time), "Storage method" and, for projects on Dropbox or on a WordPress site, the sync status of the project. On WordPress, "Edit Project" and "Delete Project" are hidden for users who are not the owner or an administrator. If the project no longer exists, the app goes back to the projects list. On small screens the buttons show only their icon, with a tooltip.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectDetails
 */
export const ProjectDetails: FC = () => {
  const project = useAtomValue(ProjectAtoms.projectSettings)

  if (project === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  return (
    <div
      className="ui-card ui-rise relative"
      style={{ minHeight: '200px' }}
    >
      {(project === null) ? <Loader /> : <ProjectDetailsCard project={project} />}
    </div>
  )
}
