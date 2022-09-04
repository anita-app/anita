import React, { ReactNode, useState } from 'react'
import { ModalBody } from 'app/components/shared-components/modals/modal-body.component'
import { ModalContent } from 'app/components/shared-components/modals/modal-content.component'
import { ModalFooter } from 'app/components/shared-components/modals/modal-footer.component'
import { ModalHeader } from 'app/components/shared-components/modals/modal-header.component'
import { TIconName } from 'app/libs/icons/icons.class'
import ReactDOM from 'react-dom'
import { ModalContext, useModalContext } from 'app/components/shared-components/modals/modal-context'

export interface IModalProps {
  title: string
  actionText: string
  type: keyof typeof bgClasses
  handleClickAction: () => void
  closeFn?: () => void
  animationClass?: string
  children: ReactNode
  icon?: TIconName
  iconClassName?: string
  disableAction?: boolean
}

const bgClasses = {
  confirm: {
    normal: 'bg-prussian-blue-500',
    hover: 'bg-prussian-blue-600',
    focus: 'bg-prussian-blue-800'
  },
  alert: {
    normal: 'bg-red-600',
    hover: 'bg-red-700',
    focus: 'bg-red-900'
  }
}

const ModalContainer: React.FC<IModalProps> = (props) => {
  const { hideModal } = useModalContext()
  const handleActionClick = () => {
    props.handleClickAction()
    hideModal()
  }
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className={`animate__animated ${props.animationClass} animate__faster fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity`} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`animate__animated ${props.animationClass} animate__faster inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
          <ModalContent icon={props.icon} iconClassName={props.iconClassName}>
            <ModalHeader>
              {props.title}
            </ModalHeader>
            <ModalBody>
              {props.children}
            </ModalBody>
          </ModalContent>
          <ModalFooter>
            <button
              onClick={handleActionClick}
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${bgClasses[props.type].normal} text-base font-medium text-white hover:${bgClasses[props.type].focus} focus:outline-none focus:ring-0 focus:${bgClasses[props.type].focus} sm:ml-3 sm:w-auto sm:text-sm`}
              disabled={props.disableAction}
            >
              {props.actionText}
            </button>
            <button onClick={hideModal} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-0 focus:bg-gray-200 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </ModalFooter>
        </div>
      </div>
    </div>
  )
}

export const Modal: React.FC<IModalProps> = (props) => {
  const container: HTMLDivElement = document.getElementById('modal-root') as HTMLDivElement
  return ReactDOM.createPortal(
    <ModalContainer {...props} />,
    container
  )
}

export const ModalProvider: React.FC = (props) => {
  const [modalProps, setModalProps] = useState<IModalProps | null>(null)
  const showModal = (modalProps: IModalProps) => {
    setModalProps({
      ...modalProps,
      animationClass: 'animate__fadeIn'
    })
  }

  const hideModal = () => {
    setModalProps((currentState = {} as IModalProps) => ({
      ...currentState!,
      animationClass: 'animate__fadeOut'
    }))
    setTimeout(() => {
      setModalProps(null)
    }, 500)
  }

  const renderComponent = () => modalProps ? <Modal {...modalProps} /> : null

  return (
    <ModalContext.Provider value={{ modalProps, showModal, hideModal }}>
      {renderComponent()}
      {props.children}
    </ModalContext.Provider>
  )
}
