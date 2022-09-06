import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing-n/anita-routes.constant'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project-n/project.declarations'
import { IdCreator } from 'app/libs/id-creator/id-creator.class'
import { Manager } from 'app/libs/manager-n/manager.class'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { FormProjectManager } from 'app/components/projects/add-edit-project-components/form-project-manager.component'
import { ProjectEditorModeToggle } from 'app/components/projects/add-edit-project-components/project-editor-mode-toggle.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

export const AddEditProject: React.FC = () => {
  const params = useParams()
  const mode = params[URL_PARAMS.projectId] ? EDITOR_MODE.edit : EDITOR_MODE.add

  const projectId = params[URL_PARAMS.projectId]

  const [hasProject, setHasProject] = useState<boolean | null | undefined>(null)

  useEffect(() => {
    let isMounted = true

    // in add mode, sets a new project
    if (mode === EDITOR_MODE.add) {
      const newProjectSystemData: TSystemData = {
        [RESERVED_AUDS_KEYS._settings]: [{ id: IdCreator.random(), title: '', description: '', createdAt: '', localStorage: LOCAL_STORAGE_SYSTEMS.IndexedDB }],
        [RESERVED_AUDS_KEYS._sections]: [{ id: IdCreator.random(), title: '', formModel: [{} as any] }]
      }
      storeDispatcher({ type: REDUX_ACTIONS.setFormProject, payload: newProjectSystemData })
      return setHasProject(true)
    }

    const fetchEProject = async () => {
      const project = await Manager.getProjectById(projectId)
      if (!project) {
        return setHasProject(undefined)
      }

      const _settings = [{ ...project.getSettings() }]
      const _sections = [...project.getSectionsDefinitions()]

      if (isMounted) {
        storeDispatcher({ type: REDUX_ACTIONS.setFormProject, payload: { _settings, _sections } })
        setHasProject(true)
      }
    }

    if (isMounted) {
      fetchEProject()
    }

    return () => {
      isMounted = false
    }
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
