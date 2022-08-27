import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant'
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function'
import { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export const ProjectTableListTdWithLinkToDetails = ({ children, tdProps, elementId }: { children: ReactNode, tdProps: {}, elementId: string }) => {

  const navigation = useNavigate();
  const params = useParams();

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    // if the target is a link, do nothing
    if (target.tagName === 'A' || target.tagName === 'BUTTON')
      return;
    navigation(urlParamFiller(ANITA_URLS.projectSectionEleDetails, [
      { name: URL_PARAMS.projectId, value: params.projectId },
      { name: URL_PARAMS.sectionId, value: params.sectionId },
      { name: URL_PARAMS.elementId, value: elementId }
    ]))
  }

  return (
    <td
      onClick={handleClick}
      className="px-6 py-4 cursor-pointer"
      {...tdProps}
    >
      {children}
    </td>
  )

}