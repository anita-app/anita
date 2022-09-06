import { IModalProps } from 'app/components/shared-components/modals/modal.component'
import { createContext, useContext } from 'react'

export type TModalContext = {
  showModal: (modalProps: IModalProps) => void
  hideModal: () => void
  modalProps: IModalProps | null
 };

const initalState: TModalContext = {
  showModal: () => {},
  hideModal: () => {},
  modalProps: null
}

export const ModalContext = createContext(initalState)
export const useModalContext = () => useContext(ModalContext)
