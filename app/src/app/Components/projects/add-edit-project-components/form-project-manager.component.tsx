import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { IProjectSettings, RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/manager/Manager.class'
import { ProjectsListLoader } from 'app/libs/projects-helpers/projects-handlers/projects-list-loader.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { SectionManager } from 'app/components/projects/add-edit-project-components/section-manager.component'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'
import React from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'

export const FormProjectManager: React.FC = () => {
  const { projectId } = useParams<URL_PARAMS>()
  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode)
  const project = useSelector((state: AnitaStore) => state.formProject.project)
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState)
  const mode: EDITOR_MODE = projectId ? EDITOR_MODE.edit : EDITOR_MODE.add
  const navigate = useNavigate()

  const handleProjectChange = (fieldName: keyof IProjectSettings, value: IProjectSettings[keyof IProjectSettings]) => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectSettings, payload: { fieldName, value } })
  }

  const handleClickSave = async () => {
    const systemData = await Manager.saveProject(project as SystemData, mode)
    await new ProjectsListLoader().load()
    Manager.setCurrentProject(systemData)
    navigate(urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: project[RESERVED_AUDS_KEYS._settings][0].id }]))
  }

  const handleClickAddSection = () => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectAddSection })
  }

  const projectFormModel = mode === EDITOR_MODE.add
    ? PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].projectInfo.newItem
    : PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].projectInfo.existingItem

  return (
    <span>
      <div className="mt-5 p-4 bg-white rounded shadow">
        <FormAutomator formModel={projectFormModel as any} element={project[RESERVED_AUDS_KEYS._settings][0]} handleChange={handleProjectChange} />
      </div>
      <div className="px-1 md:px-2 lg:px-3">
        {project[RESERVED_AUDS_KEYS._sections].map((section, index) => <SectionManager key={section.id} section={section} sectionIndex={index} />)}
      </div>
      <div className="mt-5 p-4 bg-white rounded shadow">
        <div className="flex sm:justify-between flex-wrap">
          <Button
            id="addSection"
            label="Add section"
            type="success"
            fill="outline"
            className="w-full sm:w-auto"
            marginClassName=""
            onClick={handleClickAddSection}
          />
          <div className="w-full sm:w-auto grid grid-cols-2 gap-4">
            <Button
              id="cancel"
              label="Cancel"
              marginClassName="mt-8 sm:mt-0 mr-3"
              type="secondary"
              className="grow"
              onClick={() => navigate(-1)}
            />
            <Button
              id="save"
              label="Save"
              type="primary"
              className="grow"
              marginClassName="mt-8 sm:mt-0"
              disabled={Object.keys(validObj).some(key => validObj[key] === false)}
              onClick={handleClickSave}
            />
          </div>
        </div>
      </div>
    </span>
  )
}
