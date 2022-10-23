import React, { Fragment, ReactNode, useState } from 'react'
import { Icons, TIconName } from 'app/libs/icons/icons.class'
import ReactDOM from 'react-dom'
import { ModalContext, useModalContext } from 'app/components/shared-components/modals/modal-context'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

export interface IModalProps {
  isOpen?: boolean
  title: string
  actionText: string
  type: Type.primary | Type.danger
  handleClickAction?: () => void
  children: ReactNode
  icon?: TIconName
  iconClassName?: string
  disableAction?: boolean
  hideCancelButton?: boolean
  hideActionRow?: boolean
}

const Modal: React.FC<IModalProps> = (props) => {
  const { hideModal } = useModalContext()
  const handleActionClick = () => {
    props.handleClickAction?.()
    hideModal()
  }
  return (
    <Transition.Root show={props.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleActionClick}>
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
                    {props.hideCancelButton !== true && (
                      <Button
                        id="cancel"
                        label="Cancel"
                        type={Type.secondary}
                        onClick={hideModal}
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
  const [modalProps, setModalProps] = useState<IModalProps>({
    isOpen: false,
    type: Type.primary,
    title: '',
    actionText: '',
    handleClickAction: () => { },
    children: null
  })
  const showModal = (modalProps: IModalProps) => {
    setModalProps({
      ...modalProps,
      isOpen: true
    })
  }

  const hideModal = () => {
    setModalProps((currentState = {} as IModalProps) => ({
      ...currentState!,
      isOpen: false
    }))
  }

  const updateModal = (newModalProps: Partial<IModalProps>) => {
    setModalProps((currentValue) => ({
      ...currentValue,
      ...newModalProps
    }))
  }

  return (
    <ModalContext.Provider value={{ modalProps, showModal, hideModal, updateModal }}>
      <ModalContainer {...modalProps} />
      {props.children}
    </ModalContext.Provider>
  )
}
