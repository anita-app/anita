import { Fragment } from 'react'
import { Icons } from 'app/libs/icons/icons.class'
import ReactDOM from 'react-dom'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import { useAtomValue } from 'jotai'
import { ModalStateAtoms } from 'app/state/modal/modal-state.atoms'
import type { FC } from 'react'
import type { IModalProps, IModalPropsOpen } from 'app/state/modal/modal-state.class'
import type { TIconName } from 'app/libs/icons/icons.class'

const ICON_CONFIG_BY_TYPE: Record<Type, { icon: TIconName; iconTextColor: string; iconBgColor: string } | null> = {
  [Type.primary]: null,
  [Type.secondary]: null,
  [Type.success]: null,
  [Type.info]: null,
  [Type.warning]: null,
  [Type.danger]: { icon: 'warningOutline', iconTextColor: 'text-red-600', iconBgColor: 'sm:bg-red-100' },
  [Type.transparent]: null,
}

const Modal: FC<IModalProps> = (props) => {
  const handleActionClick = (callback?: () => void) => {
    if (typeof callback === 'function') {
      callback()
    }
    ModalState.hideModal()
  }
  const cancelAction = () => {
    (props as IModalPropsOpen).handleClickCancel?.()
    ModalState.hideModal()
  }
  const onCloseAction = () => {
    (props as IModalPropsOpen).handleOnClose?.()
  }

  const config = props as IModalPropsOpen
  const iconConfig = config.type ? ICON_CONFIG_BY_TYPE[config.type] : null

  return (
    <Transition.Root
      show={props.isOpen}
      as={Fragment}
    >
      {/* Above the header (z-20) and the other dialogs: a modal covers the whole app. */}
      <Dialog
        as="div"
        className="relative z-40"
        onClose={onCloseAction}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#000f20]/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              {/* At most as tall as the window: the title and the buttons stay in view, the content scrolls. */}
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white border border-[#000f20]/5 px-4 pt-5 pb-4 text-left shadow-[0_30px_60px_-20px_rgba(0,35,70,0.45)] transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)]">
                <div className="sm:flex sm:items-start gap-2 shrink-0">
                  {iconConfig && (
                    <div className={`absolute sm:relative right-3 sm:right-1.5 top-2.5 sm:top-0 flex items-center justify-center h-12 w-12 shrink-0 rounded-full ${iconConfig.iconBgColor} sm:mx-0 sm:h-10 sm:w-10`}>
                      {Icons.render(iconConfig.icon, `${iconConfig.iconTextColor} text-xl -mt-1`)}
                    </div>
                  )}
                  <Dialog.Title
                    as="h3"
                    className={`ui-title text-lg leading-6 text-left w-full ${iconConfig ? 'sm:pt-1' : ''}`}
                  >
                    {config.title}
                  </Dialog.Title>
                </div>
                {/* Aligned with the title, also when there is an icon; the padding keeps focus rings visible. */}
                <div className={`mt-2 min-h-0 overflow-y-auto overscroll-contain -mx-1 px-1 ${iconConfig ? 'sm:pl-13' : ''}`}>
                  {config.children}
                </div>
                {!config.hideActionRow && (
                  <div className="flex flex-wrap items-center justify-end gap-y-2 mt-5 pt-4 border-t border-[#eef1f5] shrink-0">
                    {config.leftButton && (
                      <Button
                        {...config.leftButton!}
                        marginClassName="mr-auto"
                      />
                    )}
                    {config.hideCancelButton !== true && (
                      <Button
                        id="cancel"
                        label="Cancel"
                        type={Type.secondary}
                        onClick={cancelAction}
                      />
                    )}
                    {!!config.ctas?.length && config.ctas!.map((cta, index) => (
                      <Button
                        key={index}
                        id="action-button"
                        type={cta.actionType || config.type!}
                        label={cta.actionText}
                        onClick={() => handleActionClick(cta.handleClickAction)}
                        disabled={cta.disableAction}
                      />
                    ))}
                  </div>)}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

/**
 * @feature navigation.dialogs
 * @title Dialogs and confirmations
 * @summary Questions and confirmations open in a window over the page, with the action buttons at the bottom.
 * @where Over any page, when an action needs an answer (for example deleting, or a choice during a sync).
 * @usage 1. Read the title and the text of the dialog.
 * 2. Click the button of the action you want, or "Cancel" to do nothing.
 * @options none
 * @rules Only one dialog is open at a time and it covers the whole app, header included; the page behind is dimmed.
 * The action buttons are at the bottom right, "Cancel" before them; some dialogs have no "Cancel" or have an extra button on the left. A button can be disabled until the dialog is filled in.
 * Dialogs for dangerous actions (such as deleting) show a red warning icon and a red action button.
 * A dialog is at most as tall as the window: title and buttons stay visible and the content scrolls.
 * Most dialogs close only with their buttons; some (such as the sync questions) also close, as a cancel, with Escape or a click outside.
 * @errors none
 * @status stable
 * @since 0.7.0
 */
export const ModalPortal: FC = () => {
  const modalConfig = useAtomValue(ModalStateAtoms.modalProps)
  return (
    ReactDOM.createPortal(
      <Modal {...modalConfig} />,
      document.getElementById('modal-root')!,
    )
  )
}
