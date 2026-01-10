import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { IdCreator } from 'app/libs/id-creator/id-creator.class'
import { Manager } from 'app/cross-refs-exports'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { FormProjectManager } from 'app/components/projects/add-edit-project-components/form-project-manager.component'
import { ProjectEditorModeToggle } from 'app/components/projects/add-edit-project-components/project-editor-mode-toggle.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import type { FC } from 'react'
import type { TSystemData } from 'app/models/project/project.declarations'

export const AddEditProject: FC = () => {
  const params = useParams()
  const mode = params[URL_PARAMS.projectId] ? EDITOR_MODE.edit : EDITOR_MODE.add

  const projectId = params[URL_PARAMS.projectId]

  const [hasProject, setHasProject] = useState<boolean | null | undefined>(null)

  useEffect(() => {
    // in add mode, sets a new project
    if (mode === EDITOR_MODE.add) {
      const newProjectSystemData: TSystemData = {
        [RESERVED_AUDS_KEYS._settings]: [{ id: IdCreator.random(), title: '', description: '', createdAt: '', localStorage: LOCAL_STORAGE_SYSTEMS.IndexedDB }],
        [RESERVED_AUDS_KEYS._sections]: [{ id: IdCreator.random(), title: '', formModel: [{} as any], createdAt: '' }],
      }
      FormProjectState.setFormProject(newProjectSystemData)
      return setHasProject(true)
    }

    const fetchEProject = async () => {
      const project = await Manager.getProjectById(projectId)
      if (!project) {
        return setHasProject(undefined)
      }

      const _settings = [{ ...project.getSettings() }]
      const _sections = [...project.getSectionsDefinitions()]

      FormProjectState.setFormProject({ _settings, _sections })
      setHasProject(true)
    }

    fetchEProject()
  }, [mode, projectId])

  if (hasProject === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  const headerText = mode === EDITOR_MODE.add ? 'Add Project' : 'Edit Project'

  return (
    <span>
      <div className="p-4 bg-white rounded shadow flex">
        <div>
          <h3 className="text-xl font-bold">{headerText}</h3>
        </div>
        {hasProject !== null && <ProjectEditorModeToggle />}
      </div>
      {hasProject === null && <Loader />}
      {hasProject !== null && <FormProjectManager />}
    </span>
  )
}
