import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const TdWithLinkToDetails = ({ children, tdProps, elementId }: { children: ReactNode, tdProps: {}, elementId: string }) => {

  const navigation = useNavigate();
  const params = useParams();

  return (
    <td
      onClick={() => navigation(urlParamFiller(ANITA_URLS.projectSectionEleDetails, [
        { name: URL_PARAMS.projectId, value: params.projectId },
        { name: URL_PARAMS.sectionId, value: params.sectionId },
        { name: URL_PARAMS.elementId, value: elementId }
      ]))}
      className="px-6 py-4 cursor-pointer"
      {...tdProps}
    >
      {children}
    </td>
  )

}