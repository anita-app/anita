import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { Link } from 'react-router-dom';

interface INoSectionDataProps {
  sectionTitle: string
  sectionId: string
  projectId: string
}

export const NoSectionData: React.FC<INoSectionDataProps> = ({ sectionTitle, sectionId, projectId }) => (
  <div className="container px-5 py-24 mx-auto">
    <div className="p-4 lg:w-2/3 mx-auto">
      <div className="h-full bg-white shadow px-8 pt-16 pb-16 rounded-lg overflow-hidden text-center relative">
        <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">Nothing here yet</h2>
        <h1 className="title-font sm:text-2xl text-xl font-medium text-gray-900 mb-3">There are no items in {sectionTitle}</h1>
        <p className="leading-relaxed mb-3">Create a new entry to populate this list</p>
        <div className="flex flex-wrap mt-7">
          <Link
            to={urlParamFiller(ANITA_URLS.projectSectionAddEle, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])}
            className="flex-grow mx-2 mt-4 text-white bg-prussian-blue-400 border-0 py-3 px-8 focus:outline-none hover:bg-prussian-blue-500 rounded font-bold text-sm"
          >Create a new element
          </Link>
        </div>
      </div>
    </div>
  </div>
);
