import { useLayoutEffect, useRef, useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { useParams } from 'react-router-dom'
import { RichText } from 'app/components/shared-components/values-renderers/rich-text.component'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { RoutingState } from 'app/state/routing/routing-state.class'
import type { FC, ReactNode } from 'react'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

interface IProjectSectionListGridElementProps {
  element: ISectionElement
  titleField: FormFieldsModel<TSupportedFormsTypes>
  descriptionKey: string
}

// Values other than text (e.g. dates) are shown as in the table.
const renderTitle = (field: FormFieldsModel<TSupportedFormsTypes>, value: unknown): ReactNode => {
  if (value === undefined || value === null || value === '') {
    return <span className="text-gray-400">Untitled</span>
  }
  return customRenderPicker(field)({ value }) as ReactNode
}

export const ProjectSectionListGridElement: FC<IProjectSectionListGridElementProps> = (props) => {
  const descriptionRef = useRef<HTMLDivElement>(null)
  const [isDescriptionCut, setIsDescriptionCut] = useState(false)
  const params = useParams()
  const description = props.descriptionKey && props.descriptionKey !== props.titleField.fieldName ? props.element[props.descriptionKey] : undefined

  // The fade is shown only when the description is taller than the card allows.
  useLayoutEffect(() => {
    const box = descriptionRef.current
    if (!box) {
      setIsDescriptionCut(false)
      return
    }
    const check = () => setIsDescriptionCut(box.scrollHeight > box.clientHeight + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(box)
    if (box.firstElementChild) {
      observer.observe(box.firstElementChild)
    }
    return () => observer.disconnect()
  }, [description])

  const handleClick = () => {
    if (params.projectId && params.sectionId && props.element.id) {
      RoutingState.goTo(ANITA_URLS.projectSectionEleDetails, [
        { name: URL_PARAMS.projectId, value: params.projectId },
        { name: URL_PARAMS.sectionId, value: params.sectionId },
        { name: URL_PARAMS.elementId, value: props.element.id },
      ])
    }
  }

  return (
    <div
      className="h-max cursor-pointer mb-6 break-inside-avoid-column"
      onClick={handleClick}
    >
      <div className="w-full bg-white rounded-lg shadow flex items-center justify-between p-6 space-x-6">
        <div className="flex-1 relative overflow-hidden">
          <div className="flex items-center space-x-3">
            {props.titleField.componentCode !== FORM_COMPONENTS_CODES.richText && (
              <h3 className="text-gray-900 text-sm font-medium">{renderTitle(props.titleField, props.element[props.titleField.fieldName])}</h3>
            )}
            {props.titleField.componentCode === FORM_COMPONENTS_CODES.richText && (
              <RichText value={props.element[props.titleField.fieldName]} />
            )}
          </div>
          {description && (
            <>
              <div
                ref={descriptionRef}
                className="mt-1 text-gray-500 text-sm max-h-96 overflow-hidden"
              >
                <RichText value={description} />
              </div>
              {isDescriptionCut && (
                <div className="bottom-0 h-10 pointer-events-none absolute inset-x-0 z-10 bg-linear-to-b from-transparent to-white"></div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
