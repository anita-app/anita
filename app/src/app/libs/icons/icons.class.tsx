import * as ionicons from 'ionicons/icons/index'
import { IonIcon } from '@ionic/react'
import React, { ReactElement } from 'react'
import { IOption } from 'app/models/parent-element/parent-element.class'
import { TextTools } from 'app/libs/tools/text-tools.class'
import { Logger } from 'app/libs/logger/logger.class'

const svgIcons = {
  table: `${process.env.PUBLIC_URL}/assets/icons/svg/table.svg`,
  format_bold: `${process.env.PUBLIC_URL}/assets/icons/svg/format_bold.svg`,
  format_italic: `${process.env.PUBLIC_URL}/assets/icons/svg/format_italic.svg`,
  format_underlined: `${process.env.PUBLIC_URL}/assets/icons/svg/format_underlined.svg`,
  format_code: `${process.env.PUBLIC_URL}/assets/icons/svg/format_code.svg`,
  format_looks_one: `${process.env.PUBLIC_URL}/assets/icons/svg/format_looks_one.svg`,
  format_looks_two: `${process.env.PUBLIC_URL}/assets/icons/svg/format_looks_two.svg`,
  format_quote: `${process.env.PUBLIC_URL}/assets/icons/svg/format_quote.svg`,
  format_list_numbered: `${process.env.PUBLIC_URL}/assets/icons/svg/format_list_numbered.svg`,
  format_list_bulleted: `${process.env.PUBLIC_URL}/assets/icons/svg/format_list_bulleted.svg`,
  format_align_left: `${process.env.PUBLIC_URL}/assets/icons/svg/format_align_left.svg`,
  format_align_center: `${process.env.PUBLIC_URL}/assets/icons/svg/format_align_center.svg`,
  format_align_right: `${process.env.PUBLIC_URL}/assets/icons/svg/format_align_right.svg`,
  format_align_justify: `${process.env.PUBLIC_URL}/assets/icons/svg/format_align_justify.svg`
}

type TSVGIcons = keyof typeof svgIcons

export type TIconName = keyof typeof ionicons | TSVGIcons

const ALL_ICONS = Object.keys(ionicons).concat(Object.keys(svgIcons))

export class Icons {
  public static getIconsOptionsList (): Array<IOption> {
    return Object.keys(ionicons)
      .map(key => ({
        label: TextTools.capitalizeFirstLetter(TextTools.camelToKebabCase(key).replace(/-/g, ' ').replace(/outline/g, '').trim()),
        value: key,
        icon: key as TIconName
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
    return <Component icon={icon} className={className} />
  }
}
