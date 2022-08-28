import { IProjectSettings } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import React from 'react'

interface IProjectNotLoadedFooterProps {
  project: IProjectSettings
}

export const ProjectNotLoadedFooter: React.FC<IProjectNotLoadedFooterProps> = ({ project }) => (
  <button onClick={() => Manager.loadProjectById(project.id)} className="px-4 py-2 text-white ml-auto inline-flex items-center md:mb-2 lg:mb-0 rounded bg-green-500 hover:bg-green-600 text-sm">
    Load project
  </button>
)
