import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Navigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { ProjectDetailsCard } from './details-card'
import type { FC } from 'react'

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
