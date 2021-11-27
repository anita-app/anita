import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { SectionElement } from 'app/data/project-structure/project-info';
import { isProjectLoaded } from 'app/libs/project-helpers/project-handlers/is-project-loaded.function';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { FormElementManager } from 'app/ui-react-components/project/add-edit-components/form-element-manager.component';
import { SaveElement } from 'app/ui-react-components/project/add-edit-components/save-element.component';
import { MainContentContainer } from 'app/ui-react-components/shared-components/common-ui-eles/main-content-container.component';
import { Loader } from 'app/ui-react-components/shared-components/loader/loader.component';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

export const AddEditSectionElement = () => {

  const params = useParams();
  const mode = params[URL_PARAMS.elementId] ? EDITOR_MODE.edit : EDITOR_MODE.add;

  const projectId = params[URL_PARAMS.projectId];
  const sectionId = params[URL_PARAMS.sectionId];
  const elementId = (mode === EDITOR_MODE.edit) ? params[URL_PARAMS.elementId] : null;

  const [element, setElement] = useState<Partial<SectionElement> | null | undefined>(null);

  useEffect(() => {
    let isMounted = true;


    const fetchElement = async () => {
      const canProceed = await isProjectLoaded(projectId);

      if (!projectId || !sectionId || !canProceed)
        return setElement(undefined);

      if (mode === EDITOR_MODE.add)
        return setElement({});

      const element = await dbInstances[projectId].callSelector<SectionElement>(sectionId, { id: elementId }).single();
      if (isMounted)
        setElement(element);
    };

    if (isMounted)
      fetchElement();

    return () => { isMounted = false; }
  }, [mode, projectId, sectionId, elementId]);

  if (element === undefined)
    return <Navigate to={ANITA_URLS.projectsList} />

  const headerText = mode === EDITOR_MODE.add ? 'Add Element' : 'Edit Element';

  store.dispatch({ type: REDUX_ACTIONS.updateFormElement, payload: element });

  return (
    <MainContentContainer headerText={headerText}>
      {element === null && <Loader />}
      {element !== null && <FormElementManager sectionId={sectionId} />}
      {element !== null && <SaveElement sectionId={sectionId} />}
    </MainContentContainer>
  )

}