import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { ProjectDetailsCard } from './details-card'

export const ProjectDetails: React.FC = () => {
  const project = useAtomValue(ProjectAtoms.projectSettings)

  if (project === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  return (
    <div className="relative border-2 border-gray-200 border-opacity-60 rounded bg-white" style={{ minHeight: '200px' }}>
      {(project === null) ? <Loader /> : <ProjectDetailsCard project={project} />}
    </div>
  )
}
