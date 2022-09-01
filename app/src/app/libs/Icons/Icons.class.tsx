import * as ionicons from 'ionicons/icons/index'
import { IonIcon } from '@ionic/react'
import React, { ReactElement } from 'react'
import { IOption } from 'app/models/ParentElement/ParentElement.class'
import { TextTools } from 'app/libs/tools/TextTools.class'
import { Logger } from 'app/libs/logger/logger.class'

export type TSVGIcons = '/assets/icons/svg/table.svg'
export type TIconName = keyof typeof ionicons | TSVGIcons

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

  public static render = (iconName: TIconName, className: string = ''): ReactElement => {
    if (!iconName.endsWith('.svg') && !ionicons[iconName]) {
      Logger.error(`[Icons.render] Icon '${iconName}' not found`)
      return null
    }
    const icon = iconName.endsWith('.svg') ? iconName : ionicons[iconName]
    return <IonIcon icon={icon} className={className} />
  }
}
