import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { ParentInfoForDetailsView, Section } from 'app/data/model/project-info';
import { GetParentInfoForDetailsView } from 'app/libs/project-helpers/get-parent-info-for-details-view.class';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const ParentsLinkShower = ({ projectId, parentsInfo, sections }: { projectId: string, parentsInfo: Array<string>, sections: Array<Section> }) => {

  const [parents, setParents] = useState<Array<ParentInfoForDetailsView>>([]);

  useEffect(() => {
    let isMounted = true;
    const getParents = async () => {
      const parents = await new GetParentInfoForDetailsView(parentsInfo, projectId, sections).get();
      if (isMounted) {
        setParents(parents);
      }
    }

    if (isMounted)
      getParents();

    return (): void => { isMounted = false; };
  }, [parentsInfo, projectId, sections]);

  return (
    <div className="p-3 pt-0">
      <p className="text-sm text-gray-500 mb-2">Parent elements:</p>
      {parents.map((parent, index) => (
        <Link to={urlParamFiller(ANITA_URLS.projectSectionEleDetails, [
          { name: URL_PARAMS.projectId, value: projectId },
          { name: URL_PARAMS.sectionId, value: parent.sectionId },
          { name: URL_PARAMS.elementId, value: parent.element.id }
        ])} key={parent.element.id} className="mr-2 py-1 px-4 bg-gray-200 hover:bg-gray-300 bg-opacity-80 rounded-md text-sm font-semibold">
          {parent.txt}
        </Link>
      ))}
    </div>
  )

};