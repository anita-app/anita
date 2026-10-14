import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Icons } from 'app/libs/icons/icons.class'
import type { FC } from 'react'
import type { TIconName } from 'app/libs/icons/icons.class'

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
  [Type.transparent]: 'informationCircleOutline',
}

const classesByType: { [key in Type]: { container: string; title: string; text: string } } = {
  [Type.primary]: { container: 'bg-blue-50 border-blue-200', title: 'text-prussian-blue-500', text: 'text-prussian-blue-400' },
  [Type.secondary]: { container: 'bg-gray-50 border-gray-200', title: 'text-gray-800', text: 'text-gray-600' },
  [Type.success]: { container: 'bg-green-50 border-green-200', title: 'text-green-800', text: 'text-green-700' },
  [Type.info]: { container: 'bg-blue-50 border-blue-200', title: 'text-blue-800', text: 'text-blue-700' },
  [Type.warning]: { container: 'bg-orange-50 border-orange-200', title: 'text-orange-800', text: 'text-orange-700' },
  [Type.danger]: { container: 'bg-red-50 border-red-200', title: 'text-red-800', text: 'text-red-700' },
  [Type.transparent]: { container: 'bg-transparent border-transparent', title: 'text-gray-800', text: 'text-gray-600' },
}

export const AlertWithDescription: FC<IAlertWithDescription> = (props) => (
  <div
    role="alert"
    className={`rounded-xl border ${classesByType[props.type].container} py-3 px-3.5`}
  >
    <div className="flex">
      <div className={`shrink-0 ${classesByType[props.type].title}`}>
        {Icons.render(iconByType[props.type])}
      </div>
      <div className="ml-3">
        <h3 className={`text-sm font-semibold ${classesByType[props.type].title}`}>{props.title}</h3>
        <p className={`mt-1 text-sm ${classesByType[props.type].text}`}>{props.description}</p>
      </div>
    </div>
  </div>
)
