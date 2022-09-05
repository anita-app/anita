import React, { useRef } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { SectionElement } from 'app/data/project-structure/project-info'
import { useNavigate, useParams } from 'react-router-dom'

interface IProjectGridListElementProps {
  element: SectionElement
  titleKey: string
  descriptionKey: string
}

const DESCRIPTION_MAX_LENGHT = 500
const shortenDescription = (string: string) => string.length > DESCRIPTION_MAX_LENGHT ? string.slice(0, DESCRIPTION_MAX_LENGHT) + ' …' : string

export const ProjectGridListElement: React.FC<IProjectGridListElementProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const navigation = useNavigate()
  const params = useParams()
  const handleClick = () => {
    if (params.projectId && params.sectionId && props.element.id) {
      navigation(urlParamFiller(ANITA_URLS.projectSectionEleDetails, [
        { name: URL_PARAMS.projectId, value: params.projectId },
        { name: URL_PARAMS.sectionId, value: params.sectionId },
        { name: URL_PARAMS.elementId, value: props.element.id }
      ]))
    }
  }

  return (
    <div ref={containerRef} key={props.element.id} className="h-max cursor-pointer mb-6 break-inside-avoid-column" onClick={handleClick}>
      <div className="w-full bg-white rounded-lg shadow flex items-center justify-between p-6 space-x-6">
        <div className="flex-1 relative">
          <div className="flex items-center space-x-3">
            <h3 className="text-gray-900 text-sm font-medium">{props.element[props.titleKey]}</h3>
          </div>
          {props.descriptionKey && props.descriptionKey !== props.titleKey && props.element[props.descriptionKey] && (
            <>
              <p className="mt-1 text-gray-500 text-sm max-h-96">
                {shortenDescription(props.element[props.descriptionKey])}
              </p>
              {props.element[props.descriptionKey].length > DESCRIPTION_MAX_LENGHT && (
                <div className="bottom-0 h-10 pointer-events-none absolute inset-x-0 z-10 bg-gradient-to-b from-transparent to-white"></div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
