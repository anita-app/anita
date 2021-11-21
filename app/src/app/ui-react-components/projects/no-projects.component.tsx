import { ANITA_URLS } from 'app/anita-routes/anita-routes.constant';
import { ProjectFileImporter } from 'app/libs/projects-helpers/file-handle-helpers/project-file-importer.class';
import { Link, useNavigate } from 'react-router-dom';
/* eslint-disable jsx-a11y/anchor-is-valid */

export const ProjectsNone = () => {

  const navigate = useNavigate();

  const handleClickImport = async () => {
    await new ProjectFileImporter().import()
    navigate(ANITA_URLS.projectsList);
  };

  return (
    <div className="container px-5 py-24 mx-auto">
      <div className="p-4 lg:w-2/3 mx-auto">
        <div className="h-full bg-white shadow px-8 pt-16 pb-16 rounded-lg overflow-hidden text-center relative">
          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">No projects found</h2>
          <h1 className="title-font sm:text-2xl text-xl font-medium text-gray-900 mb-3">You do not have any Projects on this device yet</h1>
          <p className="leading-relaxed mb-3">You can create a new project or import one from an existing project file.</p>
          <div className="flex flex-wrap mt-7">
            <a
              href="#"
              onClick={handleClickImport}
              className="flex-grow mx-2 mt-4 text-white bg-prussian-blue-400 border-0 py-3 px-8 focus:outline-none hover:bg-prussian-blue-500 rounded font-bold text-sm"
            >Import an existing project
            </a>
            <Link
              to={ANITA_URLS.projectAdd}
              className="flex-grow mx-2 mt-4 bg-gray-200 border-0 py-3 px-8 focus:outline-none hover:bg-gray-400 rounded font-bold text-sm"
            >Create a new project
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
};
