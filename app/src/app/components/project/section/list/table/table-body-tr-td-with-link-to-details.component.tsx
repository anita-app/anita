import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { useParams } from 'react-router-dom'
import type { FC, ReactNode } from 'react'

interface IProjectSectionListTableTdWithLinkToDetailsProps {
  elementId: string | undefined
  children: ReactNode
}

export const ProjectSectionListTableBodyTrTdWithLinkToDetails: FC<IProjectSectionListTableTdWithLinkToDetailsProps> = (props) => {
  const params = useParams()

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const target = e.target as HTMLElement
    // if the target is a link, do nothing
    if (target.tagName === 'A' || target.tagName === 'BUTTON') {
      return
    }
    if (!props.elementId || !params.projectId || !params.sectionId) {
      return
    }
    RoutingState.goTo(ANITA_URLS.projectSectionEleDetails, [
      { name: URL_PARAMS.projectId, value: params.projectId },
      { name: URL_PARAMS.sectionId, value: params.sectionId },
      { name: URL_PARAMS.elementId, value: props.elementId },
    ])
  }

  return (
    <td
      onClick={handleClick}
      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0 cursor-pointer"
    >
      {props.children}
    </td>
  )
}
