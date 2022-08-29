import * as ionicons from 'ionicons/icons/index'
import { IonIcon } from '@ionic/react'
import React, { ReactElement } from 'react'
import { IOption } from 'app/Models/ParentElement/ParentElement.class'
import { TextTools } from 'app/libs/tools/TextTools.class'

export class Icons {
  public static getIconsOptionsList (): Array<IOption> {
    return Object.keys(ionicons)
      .map(key => ({
        label: TextTools.capitalizeFirstLetter(TextTools.camelToKebabCase(key).replace(/-/g, ' ')),
        value: key
      }))
      .filter(option => !option.value.endsWith('Sharp'))
  }

  public static getIconComponent = (iconName: keyof typeof ionicons): ReactElement => <IonIcon icon={iconName} />
}
