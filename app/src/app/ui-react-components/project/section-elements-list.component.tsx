import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { dbInstances } from 'app/data/db-instances.const';
import { RESERVED_AUDS_KEYS, SectionElement } from 'app/data/project-structure/project-info';
import { isProjectLoaded } from 'app/libs/project-helpers/project-handlers/is-project-loaded.function';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { findSectionById } from 'app/libs/tools/find-section-by-id.function';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { TableList } from 'app/ui-react-components/project/list-components/tableList.component';
import { NoSectionData } from 'app/ui-react-components/project/no-section-data.component';
import { AddEditElementButton } from 'app/ui-react-components/shared-components/buttons/add-edit-element-button.component';
import { MainContentContainer } from 'app/ui-react-components/shared-components/common-ui-eles/main-content-container.component';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router';

export const SectionElementsList = () => {

  const params = useParams();
  const projectId = params[URL_PARAMS.projectId];
  const sectionId = params[URL_PARAMS.sectionId];
  const project = useSelector((state: AnitaStore) => state.project);
  const [sectionData, setSectionData] = useState<Array<SectionElement>>(null);

  useEffect(() => {
    let isMounted = true;
    const getSectionData = async () => {

      if (!isProjectLoaded(projectId))
        return;

      const data = await dbInstances[projectId].callSelector<SectionElement>(sectionId).multiple();
      if (isMounted)
        setSectionData(data);
    }

    if (isMounted)
      getSectionData();

    return () => { isMounted = false; };
  }, [sectionId, projectId]);

  if (project === null)
    return <Navigate to={ANITA_URLS.projectsList} />;

  const sectionInfo = findSectionById(project[RESERVED_AUDS_KEYS._sections], sectionId);

  if (sectionData === null)
    return <div>Loading...</div>;

  if (sectionData.length === 0)
    return <NoSectionData sectionId={sectionId} sectionTitle={sectionInfo.title} projectId={projectId} />;

  return (
    <MainContentContainer headerText={sectionInfo.title}>
      <TableList sectionInfo={sectionInfo} sectionData={sectionData} />
      <AddEditElementButton projectId={projectId} sectionId={sectionId} mode={EDITOR_MODE.add} />
    </MainContentContainer>
  )

}