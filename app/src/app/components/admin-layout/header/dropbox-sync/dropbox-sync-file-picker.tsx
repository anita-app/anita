import { useMultiState } from 'app/components/hooks/multi-state.hook'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FileExplorer } from 'app/components/shared-components/file-explorer/file-explorer'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { Manager } from 'app/cross-refs-exports'
import { TextTools } from 'app/libs/tools/text-tools.class'
import { useEffect, useRef } from 'react'
import { ModalState } from 'app/state/modal/modal-state.class'
import type { FC } from 'react'
import type { IModalProps } from 'app/state/modal/modal-state.class'
import type { ISharedFileMeta } from 'app/libs/cloud-sync/cloud-sync.const'

interface DropboxSyncFilePickerState {
  files: Array<ISharedFileMeta> | null
  selected: ISharedFileMeta | null
  currentFolder: ISharedFileMeta | null
  isChangingFolder: boolean
  direction: 'forward' | 'back'
}

const handleSaveHere = (path: string) => {
  Manager.getCurrentProject()?.uploadToCloudService(path)
  // todo
}

const DropboxSyncFilePicker: FC = () => {
  const [state, setState, getState] = useMultiState<DropboxSyncFilePickerState>({
    files: null,
    selected: null,
    currentFolder: null,
    isChangingFolder: false,
    direction: 'forward',
  })
  const pathsHistoryRef = useRef<Array<string>>([])
  const getFiles = async () => {
    const path = pathsHistoryRef.current[pathsHistoryRef.current.length - 1]
    const files = await DropboxHelper.instance.getFileListForPath(path)
    setState({ files, isChangingFolder: false })
    ModalState.updateModal({
      ctas: [{
        actionText: 'Save here',
        disableAction: false,
        handleClickAction: handleSaveHere.bind(null, path),
      }],
    })
  }

  useEffect(() => {
    getFiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goBack = async () => {
    pathsHistoryRef.current.pop()
    const selectedPath = pathsHistoryRef.current[pathsHistoryRef.current.length - 1]
    setState({ isChangingFolder: true, direction: 'back', currentFolder: null, selected: null })
    const modalProps: Partial<IModalProps> = {
      ctas: [{
        disableAction: true,
        actionText: 'Save here',
        handleClickAction: handleSaveHere.bind(null, selectedPath),
      }],
    }
    if (!pathsHistoryRef.current.length) {
      modalProps.leftButton = undefined
    }
    ModalState.updateModal(modalProps)
    getFiles()
  }

  const handleNavigateToFolder = async (currentFolder: ISharedFileMeta) => {
    const selectedPath = currentFolder.path || '/'
    ModalState.updateModal({
      ctas: [{
        actionText: 'Save here',
        disableAction: true,
        handleClickAction: handleSaveHere.bind(null, selectedPath),
      }],
      leftButton: {
        id: 'file-picker-go-back',
        label: 'Back',
        type: Type.transparent,
        iconLeft: 'chevronBack',
        onClick: goBack,
      },
    })
    setState({ isChangingFolder: true, direction: 'forward', selected: null, currentFolder })
    pathsHistoryRef.current.push(currentFolder.path!)
    await getFiles()
  }

  const handleSelectFolder = async (file: ISharedFileMeta) => {
    const selected = getState().selected?.id === file.id ? null : file
    const actionText = selected === file ? `Save in ${TextTools.shortenString(file.name)}` : 'Save here'
    const selectedPath = selected ? selected.path : pathsHistoryRef.current[pathsHistoryRef.current.length - 1]
    ModalState.updateModal({
      ctas: [{
        actionText,
        handleClickAction: handleSaveHere.bind(null, selectedPath || '/'),
      }],
    })
    setState({ selected })
  }

  if (!state.files) {
    return (
      <div className="relative h-96">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-2">
      <FileExplorer
        files={state.files}
        isChangingFolder={state.isChangingFolder}
        direction={state.direction}
        selected={state.selected}
        currentFolder={state.currentFolder}
        onSelectehandleSelectFolder={handleSelectFolder}
        onNavigateToFolder={handleNavigateToFolder}
      />
    </div>
  )
}

export const FILE_PICKER_MODAL_CONFIG: IModalProps = {
  title: 'Pick a folder',
  type: Type.primary,
  ctas: [{
    actionText: 'Save here',
    handleClickAction: handleSaveHere.bind(null, '/'),
  }],
  children: (
    <><DropboxSyncFilePicker /></>
  ),
}
