import { ANITA_URLS } from 'app/anita-routes/anita-routes.constant';
import { ProjectImportButton } from 'app/ui-react-components/projects/project-importer-components/import-project-modal.component';
import { Link } from 'react-router-dom';
/* eslint-disable jsx-a11y/anchor-is-valid */

export const ProjectsNone = () => {

  // className = ""

  return (
    <div className="container px-0 md:px2 lg:px-5 pt-20 md:pt-24 mx-auto">
      <div className="p-4 lg:w-2/3 mx-auto">
        <div className="h-full bg-white shadow px-8 pt-16 pb-16 rounded-lg overflow-hidden text-center relative">
          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">No projects found</h2>
          <h1 className="title-font sm:text-2xl text-xl font-medium text-gray-900 mb-3">You don't have any Projects on this device yet</h1>
          <p className="leading-relaxed mb-3">You can create a new project or import one from an existing project file.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-2 mt-7">
            <ProjectImportButton btnType="text" />
            <Link
              to={ANITA_URLS.projectAdd}
              className="w-full flex flex-wrap content-center justify-center mt-4 bg-gray-200 border-0 py-3 px-8 focus:outline-none hover:bg-gray-400 rounded font-bold text-sm"
            >Create a new project
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
};
