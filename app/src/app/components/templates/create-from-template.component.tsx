import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { Manager } from 'app/cross-refs-exports'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { Icons } from 'app/libs/icons/icons.class'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { StorageChoice, defaultStorageChoice, useWritableRemotes } from 'app/components/remotes/storage-choice.component'
import { useDropboxIsWritable } from 'app/components/remotes/dropbox-icon.component'
import { getStoreErrorMessage } from 'app/components/remotes/store-project-dialog.component'
import { TemplateIcon, accentOfCategory, useTemplatesCatalog } from 'app/components/templates/template-gallery.component'
import { checkSiteOfStorageChoice, storageChoiceNeedsLogin, storeProject } from 'app/libs/cloud-sync/store-project.function'
import { DROPBOX_PROJECTS_FOLDER, DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { TemplatesCatalog } from 'app/libs/templates/templates-catalog.class'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import type { CSSProperties, FC } from 'react'
import type { TStorageChoice } from 'app/components/remotes/storage-choice.component'
import type { IProjectTemplate, ITemplateField } from 'app/libs/templates/templates-catalog.class'
import type { TSystemData } from 'app/models/project/project.declarations'
import type { TIconName } from 'app/libs/icons/icons.class'

const FIELD_KINDS: Record<number, { label: string; icon: TIconName }> = {
  1: { label: 'Text', icon: 'textOutline' },
  2: { label: 'Long text', icon: 'documentTextOutline' },
  3: { label: 'Check box', icon: 'checkboxOutline' },
  4: { label: 'Drop-down', icon: 'chevronDownCircleOutline' },
  5: { label: 'Choice', icon: 'radioButtonOnOutline' },
  8: { label: 'Date', icon: 'calendarOutline' },
  9: { label: 'Date & time', icon: 'timeOutline' },
  12: { label: 'Long text', icon: 'documentTextOutline' },
}

const INPUT_TYPE_LABELS: Record<string, string> = { email: 'Email', number: 'Number', tel: 'Phone', url: 'Link', color: 'Color' }

const fieldKind = (field: ITemplateField) => {
  const kind = FIELD_KINDS[field.componentCode] ?? FIELD_KINDS[1]
  return field.componentCode === 1 && field.type && INPUT_TYPE_LABELS[field.type] ? { ...kind, label: INPUT_TYPE_LABELS[field.type] } : kind
}

const TemplatePreview: FC<{ template: IProjectTemplate }> = (props) => {
  const titles = Object.fromEntries(props.template.sections.map(section => [section.key, section.title]))
  return (
    <div className="space-y-3">
      {props.template.sections.map((section, index) => (
        <div
          key={section.key}
          className="ui-card ui-rise p-4"
          style={{ '--d': index + 1 } as CSSProperties}
        >
          <div className="flex items-center gap-2.5">
            <span className="ui-menu-tile text-[#006fdf] bg-[#eef4fc]">{Icons.render(section.icon ?? 'chevronForwardOutline')}</span>
            <h3 className="font-semibold text-[#0b1f36]">{section.title}</h3>
          </div>
          {!!section.childOf?.length && (
            <p className="text-xs text-[#7a8799] mt-1.5">Each record can be linked to {section.childOf.map(key => titles[key]).join(', ')}</p>
          )}
          <ul className="flex flex-wrap gap-2 mt-3">
            {section.fields.map(field => {
              const kind = fieldKind(field)
              return (
                <li
                  key={field.fieldName}
                  className="flex items-center gap-1 rounded-full bg-[#f4f7fb] border border-[#e6ecf3] px-2 py-1 text-xs font-medium text-[#33445a]"
                  title={kind.label}
                >
                  <span className="text-[#8a97a8]">{Icons.render(kind.icon)}</span>
                  {field.label}
                  {field.options && <span className="text-[#9aa7b8] font-normal">({field.options.map(option => option.label).join(', ')})</span>}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

const createLabel = (storage: TStorageChoice): string => {
  if (storage.kind === 'connect') {
    return 'Create and connect WordPress'
  }
  return storageChoiceNeedsLogin(storage) ? 'Create and connect Dropbox' : 'Create project'
}

/**
 * @feature template.sample-records
 * @title Start a template with example records
 * @summary Fills a project created from a template with a few realistic records, already linked to each other, to see how
 * everything works.
 * @where "Start with some example records" checkbox on the page of a template.
 * @usage 1. Open a template from the gallery.
 * 2. Tick or untick "Start with some example records".
 * 3. Create the project.
 * @options Ticked by default when there are no projects on the device yet, unticked otherwise.
 * @rules Shown only for templates that come with examples. Dates of the examples are set relative to the day the project is
 * created. The records are saved, and uploaded to Dropbox or WordPress, together with the project; delete them whenever
 * you want. "Customize the structure first" creates the project without examples.
 * @errors none
 * @status stable
 * @since 1.0.0
 * @related template.create-project
 */
const CreateFromTemplateForm: FC<{ template: IProjectTemplate; accent: string; categoryLabel?: string }> = (props) => {
  const remotes = useWritableRemotes()
  const dropboxIsWritable = useDropboxIsWritable()
  const [title, setTitle] = useState(props.template.title)
  const [description, setDescription] = useState(props.template.description)
  const [storage, setStorageState] = useState<TStorageChoice>(() => defaultStorageChoice(remotes, true, dropboxIsWritable))
  const [storageTouched, setStorageTouched] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const projects = useAtomValue(ProjectsListAtoms.projects)
  const hasSamples = TemplatesCatalog.hasSamples(props.template)
  // Proposed to whoever has no projects yet, to see the template at work.
  const [samplesChoice, setSamplesChoice] = useState<boolean | null>(null)
  const withSamples = hasSamples && (samplesChoice ?? !projects?.length)

  const setStorage = (choice: TStorageChoice) => {
    setStorageTouched(true)
    setStorageState(choice)
  }

  // Connected sites and Dropbox are read asynchronously: propose them when they arrive.
  const firstRemoteId = remotes[0]?.remoteId
  useEffect(() => {
    if (!storageTouched && (firstRemoteId || dropboxIsWritable)) {
      setStorageState(defaultStorageChoice(remotes, true, dropboxIsWritable))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRemoteId, dropboxIsWritable, storageTouched])
  const [error, setError] = useState<string | null>(null)

  const buildProject = (options: { withSamples?: boolean } = {}) => {
    const systemData = TemplatesCatalog.instantiate(props.template, { title: title.trim(), description: description.trim() }, options)
    if (storage.kind === 'remote') {
      systemData[RESERVED_AUDS_KEYS._settings][0].remoteStorage = storage.remoteId
      systemData[RESERVED_AUDS_KEYS._settings][0].remoteAccessLevel = storage.accessLevel
    } else if (storage.kind === 'dropbox' && !storageChoiceNeedsLogin(storage)) {
      systemData[RESERVED_AUDS_KEYS._settings][0].remoteStorage = DROPBOX_REMOTE_ID
      if (storage.folder !== DROPBOX_PROJECTS_FOLDER) {
        systemData[RESERVED_AUDS_KEYS._settings][0].dropboxFolder = storage.folder
      }
    }
    return systemData
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Give the project a name.')
      return
    }
    setError(null)
    setIsWorking(true)
    const needsLogin = storageChoiceNeedsLogin(storage)
    try {
      // The site is checked before saving, so that a wrong address does not leave a half-done project.
      const site = await checkSiteOfStorageChoice(storage)
      const project = buildProject({ withSamples })
      let systemData: TSystemData
      if (withSamples) {
        // The records are saved together with the project, so that they are uploaded with it.
        await Manager.importProject(project)
        systemData = { [RESERVED_AUDS_KEYS._settings]: project[RESERVED_AUDS_KEYS._settings], [RESERVED_AUDS_KEYS._sections]: project[RESERVED_AUDS_KEYS._sections] }
      } else {
        systemData = await new ProjectSaver(project as TSystemData, EDITOR_MODE.add).save()
      }
      const projectId = systemData[RESERVED_AUDS_KEYS._settings][0].id
      Manager.setCurrentProject(systemData)
      if (needsLogin) {
        // Leaves the app: the project is linked when the user comes back from the site or from Dropbox.
        await storeProject(projectId, storage, site)
        return
      }
      RoutingState.goTo(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: projectId }])
    } catch (createError) {
      setError(getStoreErrorMessage(createError, storage, remotes.find(remote => storage.kind === 'remote' && remote.remoteId === storage.remoteId)?.data.site_name))
      setIsWorking(false)
    }
  }

  const handleCustomize = () => {
    FormProjectState.setDraftForNewProject(buildProject())
    RoutingState.navigate(`${ANITA_URLS.projectAdd}?draft=1`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-5">
        <div className="flex items-start gap-4">
          <TemplateIcon
            icon={props.template.icon}
            accent={props.accent}
            sizeClassName="w-14 h-14 text-3xl shadow-[0_10px_24px_-12px_rgba(0,35,70,0.35)]"
          />
          <div className="ui-rise">
            {props.categoryLabel && <p className="ui-eyebrow">{props.categoryLabel}</p>}
            <h1 className="ui-title text-2xl">{props.template.title}</h1>
            <p className="text-[#5b6b80] mt-1">{props.template.description}</p>
          </div>
        </div>

        <div className="ui-card ui-rise p-5 md:p-6 space-y-4">
          <div>
            <label
              htmlFor="templateProjectTitle"
              className="block text-sm font-semibold text-[#33445a] mb-1"
            >
              Project name
            </label>
            <input
              id="templateProjectTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={`${FORM_ELEMENTS_CSS_CLASSES} w-full px-3 py-2`}
            />
          </div>
          <div>
            <label
              htmlFor="templateProjectDescription"
              className="block text-sm font-semibold text-[#33445a] mb-1"
            >
              Description
            </label>
            <input
              id="templateProjectDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${FORM_ELEMENTS_CSS_CLASSES} w-full px-3 py-2`}
            />
          </div>
          {hasSamples && (
            <label
              htmlFor="templateWithSamples"
              className="flex items-start gap-3 rounded-xl border border-[#e1e8f1] p-3.5 cursor-pointer transition hover:border-[#c3d0e0] hover:bg-[#f9fbfe] has-[:checked]:border-[#2d96ff] has-[:checked]:bg-[#f4f8fe]"
            >
              <input
                id="templateWithSamples"
                type="checkbox"
                checked={withSamples}
                onChange={(event) => setSamplesChoice(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-prussian-blue-500"
              />
              <span>
                <span className="block text-sm font-semibold text-[#0b1f36]">Start with some example records</span>
                <span className="block text-xs text-[#7a8799]">A few realistic records, already linked to each other, to see how everything works. Delete them whenever you want.</span>
              </span>
            </label>
          )}
          <div>
            <p className="text-sm font-semibold text-[#33445a] mb-2">Where to save it</p>
            <StorageChoice
              value={storage}
              onChange={setStorage}
              allowLocal={true}
            />
          </div>

          {error && (
            <AlertWithDescription
              title="The project was not created"
              description={error}
              type={Type.warning}
            />
          )}

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#eef1f5]">
            <Button
              id="createFromTemplate"
              label={isWorking ? 'Creating…' : createLabel(storage)}
              iconLeft="checkmarkOutline"
              type={Type.primary}
              size="lg"
              disabled={isWorking}
              onClick={handleCreate}
              marginClassName=""
            />
            <Button
              id="customizeTemplate"
              label="Customize the structure first"
              type={Type.secondary}
              size="lg"
              disabled={isWorking || storageChoiceNeedsLogin(storage)}
              onClick={handleCustomize}
              marginClassName=""
            />
          </div>
          <p className="text-xs text-[#7a8799]">You can change sections and fields at any time from &quot;Edit project&quot;.</p>
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="ui-eyebrow mb-3">What&apos;s inside</h2>
        <TemplatePreview template={props.template} />
      </div>
    </div>
  )
}

/**
 * Page to create a project from a template: preview of its structure, name and storage.
 *
 * @feature template.create-project
 * @title Create a project from a template
 * @summary Preview the sections and fields of a template, name the project, choose where to save it and create it in one click.
 * @where Click a template in the gallery: page with the form and "What's inside"; "All templates" goes back to the gallery.
 * @usage 1. Look at "What's inside": sections, their fields and links between sections.
 * 2. Change "Project name" and "Description" if you want.
 * 3. Choose "Where to save it".
 * 4. Click "Create project" ("Create and connect Dropbox" or "Create and connect WordPress" when a login is needed), or
 * "Customize the structure first" to change sections and fields in the editor before creating it.
 * @options Project name and description (default: those of the template). "Start with some example records". Where to save it:
 * only this device, Dropbox, a connected WordPress site or a new WordPress site; a connected Dropbox or site is proposed
 * when there is one.
 * @rules The name is required ("Give the project a name."). When Dropbox or the site needs a login, the browser leaves the app
 * and the project is linked when you come back; "Customize the structure first" is then disabled. The address of a new
 * site is checked before anything is saved. Problems are shown in "The project was not created". A template that is no
 * longer in the catalog shows "This template is no longer available."; if the catalog cannot be downloaded, "The
 * template could not be downloaded." with "Try again". After creation the project opens.
 * @errors wordpress.network, wordpress.pluginMissing, wordpress.originNotAllowed, dropbox.network, dropbox.authFailed
 * @status stable
 * @since 1.0.0
 * @routes projectNewFromTemplate
 * @related template.gallery, template.sample-records, project.create, section.add
 */
export const CreateFromTemplate: FC = () => {
  const params = useParams()
  const templateId = params[URL_PARAMS.templateId]
  const { loaded, error, retry } = useTemplatesCatalog()
  const catalog = loaded?.catalog
  const template = useMemo(() => catalog?.templates.find(item => item.id === templateId), [catalog, templateId])

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to={ANITA_URLS.projectNew}
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#5b6b80] hover:text-[#006fdf] transition-colors mb-4"
      >
        {Icons.render('arrowBackOutline')} All templates
      </Link>
      {!catalog && !error && <Loader />}
      {error && (
        <div className="text-center text-gray-600 py-8">
          <p>The template could not be downloaded.</p>
          <Button
            id="retryTemplate"
            label="Try again"
            type={Type.secondary}
            onClick={retry}
            marginClassName="mt-3"
          />
        </div>
      )}
      {catalog && !template && <p className="text-center text-gray-600 py-8">This template is no longer available.</p>}
      {catalog && template && (
        <CreateFromTemplateForm
          key={template.id}
          template={template}
          accent={accentOfCategory(catalog.categories.map(item => item.id), template.category)}
          categoryLabel={catalog.categories.find(item => item.id === template.category)?.label}
        />
      )}
    </div>
  )
}
