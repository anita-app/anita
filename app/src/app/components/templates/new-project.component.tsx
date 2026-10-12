import { TemplateGallery } from 'app/components/templates/template-gallery.component'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import type { FC } from 'react'

/**
 * Starting point to create a project: templates, blank project or import.
 */
export const NewProject: FC = () => (
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create a project</h1>
        <p className="text-gray-600 mt-1">Pick a template to start in a click: you can change its sections and fields whenever you want.</p>
      </div>
      <div className="shrink-0">
        <ImportProjectButton btnType="text" />
      </div>
    </div>
    <TemplateGallery showBlankCard={true} />
  </div>
)
