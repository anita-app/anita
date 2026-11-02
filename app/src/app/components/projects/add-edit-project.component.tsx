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
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import type { FC } from 'react'
import type { TSystemData } from 'app/models/project/project.declarations'

/**
 * @feature project.edit
 * @title Edit a project
 * @summary Change the name, description, storage, sections and fields of an existing project.
 * @where "Edit Project" button on the card of a loaded project (Projects screen) and on the details page of the project; it opens
 * the "Edit Project" editor.
 * @usage 1. Click "Edit Project".
 * 2. Change the project info, add, change or delete sections and fields.
 * 3. Click "Save", or "Cancel" to leave without changes.
 * @options "Advanced mode" toggle, to see and set identifiers and stored values.
 * @rules It is the same editor used for a new project ("Add Project"), headed "Edit Project". "Save" stays disabled while a
 * required field is empty or invalid. If the project does not exist (old link, deleted project) the app goes back to the
 * Projects list. The identifier of a field that already exists cannot be changed, so its records keep their values.
 * Sections and fields deleted in the editor are removed from the structure of the project when you save. On a project
 * shared on a WordPress site, only its owner and the administrators of the site see "Edit Project". Saved changes are
 * synced to Dropbox or to the WordPress site if the project is stored there. After saving, the project opens.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectEdit
 * @related project.create, project.settings, section.add, section.fields, project.advanced-editor
 */
export const AddEditProject: FC = () => {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const mode = params[URL_PARAMS.projectId] ? EDITOR_MODE.edit : EDITOR_MODE.add

  const projectId = params[URL_PARAMS.projectId]

  const [hasProject, setHasProject] = useState<boolean | null | undefined>(null)

  useEffect(() => {
    // in add mode, sets a new project
    if (mode === EDITOR_MODE.add) {
      // ?draft=1: the editor opens on the project prepared from a template.
      const draft = searchParams.get('draft') ? FormProjectState.getDraftForNewProject() : null
      const newProjectSystemData: TSystemData = draft ?? {
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
  }, [mode, projectId, searchParams])

  if (hasProject === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  const headerText = mode === EDITOR_MODE.add ? 'Add Project' : 'Edit Project'

  return (
    <span>
      <div className="ui-card ui-rise p-4 md:px-5 flex items-end">
        <div>
          <p className="ui-eyebrow">Project</p>
          <h3 className="ui-title text-xl">{headerText}</h3>
        </div>
        {hasProject !== null && <ProjectEditorModeToggle />}
      </div>
      {hasProject === null && <Loader />}
      {hasProject !== null && <FormProjectManager />}
    </span>
  )
}
