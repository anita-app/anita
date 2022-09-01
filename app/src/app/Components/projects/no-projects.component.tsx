import React from 'react'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'

export const ProjectsNone: React.FC = () => (
  <div className="container px-0 md:px2 lg:px-5 pt-20 md:pt-24 mx-auto">
    <div className="p-4 lg:w-2/3 mx-auto">
      <div className="h-full bg-white shadow px-8 pt-16 pb-16 rounded-lg overflow-hidden text-center relative">
        <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">No projects found</h2>
        <h1 className="title-font sm:text-2xl text-xl font-medium text-gray-900 mb-3">You don&apos;t have any Projects on this device yet</h1>
        <p className="leading-relaxed mb-3">You can create a new project or import one from an existing project file.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-2 mt-7">
          <ImportProjectButton btnType="text" />
          <Button
            id="createProject"
            label="Create a new project"
            type="primary"
            size="lg"
            href={ANITA_URLS.projectAdd}
            marginClassName="mt-4 lg:mt-0"
          />
        </div>
      </div>
    </div>
  </div>
)
