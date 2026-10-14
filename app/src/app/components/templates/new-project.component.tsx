import { TemplateGallery } from 'app/components/templates/template-gallery.component'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { PageHeader } from 'app/components/shared-components/common-ui-eles/page-header.component'
import type { FC } from 'react'

/**
 * Starting point to create a project: templates, blank project or import.
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
