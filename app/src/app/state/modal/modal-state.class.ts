import { Bucket } from 'app/state/bucket.state'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalStateAtoms } from './modal-state.atoms'
import type { IButtonWithTooltipProps } from 'app/components/shared-components/common-ui-eles/button.component'
import type { ReactNode } from 'react'

interface ICta {
  actionText: string
  actionType?: Type
  disableAction?: boolean
  handleClickAction?: () => void
}

export interface IModalPropsOpen {
  isOpen?: true
  title: string
  children: ReactNode
  type?: Type.primary | Type.danger
  hideCancelButton?: boolean
  hideActionRow?: boolean
  leftButton?: IButtonWithTooltipProps
  ctas?: Array<ICta>
  handleClickCancel?: () => void
  handleOnClose?: () => void
}

// When isOpen is false or not provided
export interface IModalPropsClosed {
  isOpen: false
}

export type IModalProps = IModalPropsOpen | IModalPropsClosed

export class ModalState {
  public static showModal = (props: IModalProps) => {
    Bucket.general.set(ModalStateAtoms.modalProps, { type: Type.primary, ...props, isOpen: true } as IModalPropsOpen)
  }

  public static updateModal = (props: Partial<IModalPropsOpen>) => {
    const currentProps = Bucket.general.get(ModalStateAtoms.modalProps)
    Bucket.general.set(ModalStateAtoms.modalProps, { ...currentProps, ...props } as IModalPropsOpen)
  }

  public static hideModal = () => {
    const currentConfig = Bucket.general.get(ModalStateAtoms.modalProps)
    Bucket.general.set(ModalStateAtoms.modalProps, { ...currentConfig, isOpen: false })
    setTimeout(() => {
      Bucket.general.set(ModalStateAtoms.modalProps, { isOpen: false })
    }, 300)
  }
}
