import { SolidBg, SolidText, Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Icons, TIconName } from 'app/libs/icons/icons.class'
import React from 'react'

interface IAlertWithDescription {
  title: string
  description: string
  type: Type
}

const iconByType: { [key in Type]: TIconName} = {
  [Type.primary]: 'informationCircleOutline',
  [Type.secondary]: 'informationCircleOutline',
  [Type.success]: 'checkmarkCircleOutline',
  [Type.info]: 'informationCircleOutline',
  [Type.warning]: 'warningOutline',
  [Type.danger]: 'alertCircleOutline',
  [Type.transparent]: 'informationCircleOutline'
}

export const AlertWithDescription: React.FC<IAlertWithDescription> = (props) => (
  <div className={`rounded-md ${SolidBg[props.type]} bg-opacity-80 py-4 px-2`}>
    <div className="flex">
      <div className="flex-shrink-0">
        <i className={`h-5 w-5 ${SolidText[props.type]}`} aria-hidden="true">{Icons.render(iconByType[props.type])}</i>
      </div>
      <div className="ml-3">
        <h3 className={`text-sm font-medium ${SolidText[props.type]}`}>{props.title}</h3>
        <div className={`mt-2 text-sm ${SolidText[props.type]}`}>
          <p>
            {props.description}
          </p>
        </div>
      </div>
    </div>
  </div>
)
