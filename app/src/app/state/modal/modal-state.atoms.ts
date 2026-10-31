import { atom } from 'jotai'
import type { IModalProps } from './modal-state.class'

/**
 * @featurePart navigation.dialogs
 */
export class ModalStateAtoms {
  public static modalProps = atom<IModalProps>({
    isOpen: false,
  })
}
