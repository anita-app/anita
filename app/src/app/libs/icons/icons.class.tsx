import * as ionicons from 'ionicons/icons/index'
import { IonIcon } from '@ionic/react'
import { TextTools } from 'app/libs/tools/text-tools.class'
import { Logger } from 'app/libs/logger/logger.class'
import type { IOption } from 'app/models/parent-element/parent-element.class'
import type { ReactElement } from 'react'

const svgIcons = {
  table: `${import.meta.env.BASE_URL}assets/icons/svg/table.svg`,
  format_bold: `${import.meta.env.BASE_URL}assets/icons/svg/format_bold.svg`,
  format_italic: `${import.meta.env.BASE_URL}assets/icons/svg/format_italic.svg`,
  format_underlined: `${import.meta.env.BASE_URL}assets/icons/svg/format_underlined.svg`,
  format_code: `${import.meta.env.BASE_URL}assets/icons/svg/format_code.svg`,
  format_looks_one: `${import.meta.env.BASE_URL}assets/icons/svg/format_looks_one.svg`,
  format_looks_two: `${import.meta.env.BASE_URL}assets/icons/svg/format_looks_two.svg`,
  format_quote: `${import.meta.env.BASE_URL}assets/icons/svg/format_quote.svg`,
  format_list_numbered: `${import.meta.env.BASE_URL}assets/icons/svg/format_list_numbered.svg`,
  format_list_bulleted: `${import.meta.env.BASE_URL}assets/icons/svg/format_list_bulleted.svg`,
  format_align_left: `${import.meta.env.BASE_URL}assets/icons/svg/format_align_left.svg`,
  format_align_center: `${import.meta.env.BASE_URL}assets/icons/svg/format_align_center.svg`,
  format_align_right: `${import.meta.env.BASE_URL}assets/icons/svg/format_align_right.svg`,
  format_align_justify: `${import.meta.env.BASE_URL}assets/icons/svg/format_align_justify.svg`,
}

type TSVGIcons = keyof typeof svgIcons

/**
 * @internal
 */
export type TIconName = keyof typeof ionicons | TSVGIcons

const ALL_ICONS = Object.keys(ionicons).concat(Object.keys(svgIcons))

/**
 * @internal
 */
export class Icons {
  public static getIconsOptionsList (): Array<IOption> {
    return Object.keys(ionicons)
      .map(key => ({
        label: TextTools.capitalizeFirstLetter(TextTools.camelToKebabCase(key).replace(/-/g, ' ').replace(/outline/g, '').trim()),
        value: key,
        icon: key as TIconName,
      }))
      .filter(option => option.value.endsWith('Outline'))
  }

  public static render = (iconName: TIconName, className: string = ''): ReactElement | null => {
    if (!ALL_ICONS.includes(iconName)) {
      Logger.error(`[Icons.render] Icon '${iconName}' not found`)
      return null
    }
    const icon = svgIcons[iconName as TSVGIcons] ? svgIcons[iconName as TSVGIcons] : ionicons[iconName as keyof typeof ionicons]
    const Component = IonIcon as any
    return (<Component
      icon={icon}
      className={className}
            />)
  }
}
