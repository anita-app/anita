import React, { useRef } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { useNavigate, useParams } from 'react-router-dom'
import { RichText } from 'app/components/shared-components/values-renderers/rich-text.component'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'

interface IProjectSectionListGridElementProps {
  element: ISectionElement
  titleField: FormFieldsModel<TSupportedFormsTypes>
  descriptionKey: string
}

const DESCRIPTION_MAX_LENGHT = 500
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const shortenDescription = (string: string) => string.length > DESCRIPTION_MAX_LENGHT ? string.slice(0, DESCRIPTION_MAX_LENGHT) + ' …' : string

export const ProjectSectionListGridElement: React.FC<IProjectSectionListGridElementProps> = (props) => {
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
            {props.titleField.componentCode !== FORM_COMPONENTS_CODES.richText && (
              <h3 className="text-gray-900 text-sm font-medium">{props.element[props.titleField.fieldName]}</h3>
            )}
            {props.titleField.componentCode === FORM_COMPONENTS_CODES.richText && (
              <RichText value={props.element[props.titleField.fieldName]} />
            )}
          </div>
          {props.descriptionKey && props.descriptionKey !== props.titleField.fieldName && props.element[props.descriptionKey] && (
            <>
              <div className="mt-1 text-gray-500 text-sm max-h-96 overflow-hidden">
                <RichText value={props.element[props.descriptionKey]} />
              </div>
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
