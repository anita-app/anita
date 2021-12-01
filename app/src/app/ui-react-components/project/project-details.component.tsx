import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { availableSystems } from 'app/data/project-form-builder/project-info-builder.constant';
import { ProjectSettings, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info';
import { isProjectLoaded } from 'app/libs/project-helpers/project-handlers/is-project-loaded.function';
import { txtByFieldValue } from 'app/libs/project-helpers/txt-by-field-value.function';
import { DeleteProjectButton } from 'app/ui-react-components/shared-components/buttons/delete-project.component';
import { EditButton } from 'app/ui-react-components/shared-components/buttons/edit-project-button.component';
import { CardFooterItemsEnd } from 'app/ui-react-components/shared-components/common-ui-eles/card-footer-items-end.component';
import { Loader } from 'app/ui-react-components/shared-components/loader/loader.component';
import * as dateFormat from 'date-format';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';

const LoadedProject = ({ project }: { project: ProjectSettings }) => (
  <div className="p-6">
    <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{project.title}</h1>

    <p className="text-gray-600 text-xs">Description</p>
    <p className="text-lg mb-3">{project.description}</p>

    <p className="text-gray-600 text-xs">Created on:</p>
    <p className="text-md mb-3">{dateFormat('yyyy/MM/dd, at hh:mm', new Date(project.createdAt))}</p>

    <p className="text-gray-600 text-xs">Storage method:</p>
    <p className="text-md">{txtByFieldValue(availableSystems, project.localStorage)}</p>

    <CardFooterItemsEnd>
      <DeleteProjectButton project={project} />
      <EditButton project={project} />
    </CardFooterItemsEnd>

  </div>
)

export const ProjectDetails = () => {

  const urlParams = useParams();
  const projectId = urlParams[URL_PARAMS.projectId];
  const [project, setElement] = useState<ProjectSettings>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      const canProceed = await isProjectLoaded(projectId);

      if (!canProceed)
        return setElement(undefined);

      const project = await dbInstances[projectId].callSelector<ProjectSettings>(RESERVED_AUDS_KEYS._settings).single();
      if (isMounted)
        setElement(project);
    }

    if (isMounted)
      loadProject();

    return () => { isMounted = false; }

  }, [projectId]);

  // If there is no DB instance loaded, for now we just redirect to the project list
  if (project === undefined)
    return <Navigate to={ANITA_URLS.projectsList} />;

  return (
    <div className="relative border-2 border-gray-200 border-opacity-60 rounded bg-white" style={{ minHeight: "200px" }}>
      {(project === null) ? <Loader /> : <LoadedProject project={project} />}
    </div>
  )

}
