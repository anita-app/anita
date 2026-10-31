import { TemplateGallery } from 'app/components/templates/template-gallery.component'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { PageHeader } from 'app/components/shared-components/common-ui-eles/page-header.component'
import type { FC } from 'react'

/**
 * Starting point to create a project: templates, blank project or import.
 *
 * @feature project.create
 * @title Create a project
 * @summary Start a new project from a template, from scratch or from a file.
 * @where "New project" button of the Projects screen, which opens the "Create a project" page; its "Start from scratch" card
 * opens the empty "Add Project" editor.
 * @usage 1. On the Projects screen click "New project".
 * 2. Pick a template, click "Start from scratch" to design your own sections and fields, or click "Import" to load a
 * project file.
 * 3. From scratch: fill in the project info, define the sections and their fields, then click "Save".
 * @options A template, a blank project ("Start from scratch") or an import. In the editor: where to store the project and
 * "Advanced mode".
 * @rules A new project is saved in the browser of this device and, if a remote storage is chosen, synced there too. "Save"
 * stays disabled while a required field is empty or invalid; "Cancel" goes back without creating anything. After
 * saving, the project opens. If the templates cannot be downloaded the page offers "Try again" and "Start from scratch".
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectNew, projectAdd
 * @related template.gallery, template.create-project, import.file, project.settings, section.add, section.fields
 */
export const NewProject: FC = () => (
  <div className="max-w-7xl mx-auto">
    <PageHeader
      eyebrow="New project"
      title="Create a project"
      description="Pick a template to start in a click: you can change its sections and fields whenever you want."
      actions={<ImportProjectButton btnType="compact" />}
    />
    <TemplateGallery showBlankCard={true} />
  </div>
)
