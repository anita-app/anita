import { Transition } from '@headlessui/react'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FileExplorer } from 'app/components/shared-components/file-explorer/file-explorer'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { IModalProps } from 'app/components/shared-components/modals/modal.component'
import { ISharedFileMeta } from 'app/libs/cloud-sync/cloud-sync.const'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import React, { useEffect, useRef, useState } from 'react'

const CloudSyncFilePicker: React.FC = () => {
  const [files, setFiles] = useState<Array<ISharedFileMeta> | null>(null)
  const [selected, setSelected] = useState<ISharedFileMeta | null>(null)
  const [currentFolder, setCurrentFolder] = useState<ISharedFileMeta | null>(null)
  const [isChangingFolder, setIsChangingFolder] = useState<boolean>(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const pathsHistoryRef = useRef<Array<string>>([])
  const { updateModal } = useModalContext()
  const getFiles = async () => {
    const path = pathsHistoryRef.current[pathsHistoryRef.current.length - 1]
    const files = await DropboxHelper.instance.getFileListForPath(path)
    setFiles(files)
    setIsChangingFolder(false)
  }

  useEffect(() => {
    getFiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNavigateToFolder = async (folder: ISharedFileMeta) => {
    setDirection('forward')
    setIsChangingFolder(true)
    setSelected(null)
    updateModal({ disableAction: true })
    setCurrentFolder(folder)
    pathsHistoryRef.current.push(folder.path!)
    await getFiles()
  }

  const handleSelectItem = async (file: ISharedFileMeta) => {
    setSelected((currentValue) => {
      const newValue = currentValue?.id === file.id ? null : file
      updateModal({ disableAction: !newValue })
      return newValue
    })
  }

  const handleSaveHere = (file: ISharedFileMeta | null) => {
    console.log('handleSaveHere ~ file', file)
    // todo
  }

  const goBack = async () => {
    setDirection('back')
    setIsChangingFolder(true)
    setSelected(null)
    updateModal({ disableAction: true })
    pathsHistoryRef.current.pop()
    getFiles()
  }

  if (!files) {
    return <div className="h-96">Loading...</div>
  }

  return (
    <>
      <FileExplorer
        files={files}
        isChangingFolder={isChangingFolder}
        direction={direction}
        selected={selected}
        currentFolder={currentFolder}
        onSelecteItem={handleSelectItem}
        onNavigateToFolder={handleNavigateToFolder}
      />
      <div className="mt-1 h-8">
        {pathsHistoryRef.current.length > 0 && (
          <Button
            id="file-picker-go-back"
            label="Back"
            type={Type.transparent}
            iconLeft="chevronBack"
            onClick={goBack}
          />
        )}
        {!pathsHistoryRef.current.length && (
        <Button
          id="save-here"
          label="Save project in the root folder"
          type={Type.transparent}
          onClick={() => handleSaveHere(currentFolder)}
        />
        )}
      </div>
      <Transition
        show={selected?.type === 'folder'}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pr-3 mt-4">
          <AlertWithDescription
            title={`Folder selected: ${selected?.name}`}
            description="The project file will be saved in this folder as a new file."
            type={Type.success}
          />
        </div>

      </Transition>
    </>
  )
}

export const FILE_PICKER_MODAL_CONFIG: IModalProps = {
  title: 'Pick a file or folder',
  actionText: 'Select',
  type: Type.primary,
  handleClickAction: () => {},
  children: (
    <><CloudSyncFilePicker /></>
  ),
  disableAction: true
}
