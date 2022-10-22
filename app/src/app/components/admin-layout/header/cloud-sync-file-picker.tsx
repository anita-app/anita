import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FileExplorer } from 'app/components/shared-components/file-explorer/file-explorer'
import { IModalProps } from 'app/components/shared-components/modals/modal.component'
import { ISharedFileMeta } from 'app/libs/cloud-sync/cloud-sync.const'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import React, { useEffect, useRef, useState } from 'react'

const CloudSyncFilePicker: React.FC = () => {
  const [files, setFiles] = useState<Array<ISharedFileMeta> | null>(null)
  const pathsHistoryRef = useRef<Array<string>>([])

  const getFiles = async () => {
    const path = pathsHistoryRef.current[pathsHistoryRef.current.length - 1]
    const files = await DropboxHelper.instance.getFileListForPath(path)
    setFiles(files)
  }

  useEffect(() => {
    getFiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileClick = async (file: ISharedFileMeta) => {
    if (file.type === 'folder') {
      pathsHistoryRef.current.push(file.path!)
      const files = await DropboxHelper.instance.getFileListForPath(file.path)
      setFiles(files)
    }
  }

  const goBack = async () => {
    pathsHistoryRef.current.pop()
    getFiles()
  }

  if (!files) {
    return <div>Loading...</div>
  }

  return (
    <>
      <FileExplorer files={files} onClick={handleFileClick} />
      {pathsHistoryRef.current.length > 0 && (
        <div className="mt-4">
          <Button
            id="file-picker-go-back"
            label="Back"
            type={Type.transparent}
            iconLeft="chevronBack"
            onClick={goBack}
          />
        </div>
      )}
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
  )
}
