import React, { Fragment, ReactNode } from 'react'
import { Icons, TIconName } from 'app/libs/icons/icons.class'
import ReactDOM from 'react-dom'
import { ModalContext, useModalContext } from 'app/components/shared-components/modals/modal-context'
import { Dialog, Transition } from '@headlessui/react'
import { Button, IButtonWithTooltipProps } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useMultiState } from 'app/components/hooks/multi-state.hook'

export interface IModalProps {
  isOpen?: boolean
  title: string
  actionText: string
  type: Type.primary | Type.danger
  children: ReactNode
  icon?: TIconName
  iconClassName?: string
  disableAction?: boolean
  hideCancelButton?: boolean
  hideActionRow?: boolean
  leftButton?: IButtonWithTooltipProps
  handleClickAction?: () => void
  handleClickCancel?: () => void
  handleOnClose?: () => void
}

const Modal: React.FC<IModalProps> = (props) => {
  const { hideModal } = useModalContext()
  const handleActionClick = () => {
    props.handleClickAction?.()
    hideModal()
  }
  const cancelAction = () => {
    props.handleClickCancel?.()
    hideModal()
  }
  const onCloseAction = () => {
    props.handleOnClose?.()
  }
  return (
    <Transition.Root show={props.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onCloseAction}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  {props.icon && (
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      {Icons.render(props.icon, `${props.iconClassName} text-xl -mt-1`)}
                    </div>
                  )}
                  <div className="text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      {props.title}
                    </Dialog.Title>
                    <div className="mt-2">
                      {props.children}
                    </div>
                  </div>
                </div>
                {!props.hideActionRow && (
                  <div className="flex items-center justify-end mt-5 sm:mt-4">
                    {props.leftButton && (
                      <Button
                        {...props.leftButton}
                        marginClassName="mr-auto"
                      />
                    )}
                    {props.hideCancelButton !== true && (
                      <Button
                        id="cancel"
                        label="Cancel"
                        type={Type.secondary}
                        onClick={cancelAction}
                      />
                    )}
                    <Button
                      id="action-button"
                      type={props.type}
                      label={props.actionText}
                      onClick={handleActionClick}
                      disabled={props.disableAction}
                    />
                  </div>)}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

const ModalContainer: React.FC<IModalProps> = (props) => (
  ReactDOM.createPortal(
    <Modal {...props} />,
    document.getElementById('modal-root')!
  )
)

export const ModalProvider: React.FC<{children: React.ReactNode}> = (props) => {
  const [state, setState] = useMultiState<IModalProps>({
    isOpen: false,
    type: Type.primary,
    title: '',
    actionText: '',
    handleClickAction: () => { },
    children: null
  })
  const showModal = (modalProps: IModalProps) => {
    setState({
      ...modalProps,
      isOpen: true
    })
  }

  const hideModal = () => {
    setState({ isOpen: false })
  }

  const updateModal = (newModalProps: Partial<IModalProps>) => {
    setState({ ...newModalProps })
  }

  return (
    <ModalContext.Provider value={{ modalProps: state, showModal, hideModal, updateModal }}>
      <ModalContainer {...state} />
      {props.children}
    </ModalContext.Provider>
  )
}
