import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import type { ReactNode } from 'react'

/** @internal */
export interface IModalChoice<T extends string> {
  value: T
  label: string
  type?: Type
}

const showPrompt = <T extends string>(title: string, children: ReactNode, choices: Array<IModalChoice<T>>, options: { hideCancelButton?: boolean } = {}): Promise<T | null> => (
  new Promise((resolve) => {
    ModalState.showModal({
      title,
      type: Type.primary,
      hideCancelButton: options.hideCancelButton,
      children,
      handleClickCancel: () => resolve(null),
      handleOnClose: () => {
        ModalState.hideModal()
        resolve(null)
      },
      ctas: choices.map(choice => ({
        actionText: choice.label,
        actionType: choice.type,
        handleClickAction: () => resolve(choice.value),
      })),
    })
  })
)

let promptQueue: Promise<unknown> = Promise.resolve()

/**
 * Shows a modal and resolves with the chosen action, or null if the user cancels.
 * Prompts are shown one at a time, so that two syncs (also of different services) never overwrite each other's question.
 * @featurePart sync.dropbox-missing-file, sync.wordpress-removed-projects
 */
export const askUser = <T extends string>(title: string, children: ReactNode, choices: Array<IModalChoice<T>>, options: { hideCancelButton?: boolean } = {}): Promise<T | null> => {
  const answer = promptQueue.then(() => showPrompt(title, children, choices, options))
  promptQueue = answer.catch(() => undefined)
  return answer
}
