import { Fragment, useEffect, useState, type FC, type FormEvent } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Icons } from 'app/libs/icons/icons.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { DropboxIcon } from 'app/components/remotes/dropbox-icon.component'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { DropboxErrorCode, DropboxSyncError, getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'
import { DROPBOX_PROJECTS_FOLDER } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { displayDropboxFolder } from 'app/libs/cloud-sync/dropbox/dropbox-files.function'
import type { IDropboxFolderEntry } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'

export interface IDropboxPickedFile {
  fileId: string
  path: string
  name: string
}

interface IDropboxPickerProps {
  open: boolean
  /** 'folder': choose where to save a project. 'file': choose a project file to open. */
  mode: 'folder' | 'file'
  /** Folder shown first. Defaults to the Anita folder. */
  initialFolder?: string
  onClose: () => void
  onPickFolder?: (folder: string) => void
  /** May throw: the error is shown in the picker. */
  onPickFile?: (file: IDropboxPickedFile) => Promise<void>
}

const isProjectFile = (entry: IDropboxFolderEntry): boolean => entry.kind === 'file' && entry.name.toLowerCase().endsWith('.json')

/**
 * Breadcrumb of the current folder: each step opens that folder.
 */
const Breadcrumb: FC<{ folder: string; onOpen: (folder: string) => void }> = (props) => {
  const parts = props.folder.split('/').filter(Boolean)
  return (
    <nav
      aria-label="Current folder"
      className="flex flex-wrap items-center gap-1 text-sm min-w-0"
    >
      <button
        type="button"
        onClick={() => props.onOpen('')}
        className="font-semibold text-[#006fdf] hover:underline"
      >
        Dropbox
      </button>
      {parts.map((part, index) => {
        const path = `/${parts.slice(0, index + 1).join('/')}`
        const isLast = index === parts.length - 1
        return (
          <Fragment key={path}>
            <span className="text-[#9aa7b8]">/</span>
            {isLast
              ? <span className="font-semibold text-[#0b1f36] truncate">{part}</span>
              : (
                <button
                  type="button"
                  onClick={() => props.onOpen(path)}
                  className="font-semibold text-[#006fdf] hover:underline truncate"
                >
                  {part}
                </button>)}
          </Fragment>
        )
      })}
    </nav>
  )
}

const PickerContent: FC<Omit<IDropboxPickerProps, 'open'>> = (props) => {
  const [folder, setFolder] = useState(props.initialFolder ?? DROPBOX_PROJECTS_FOLDER)
  const [entries, setEntries] = useState<Array<IDropboxFolderEntry> | null>(null)
  // The Anita folder is created with the first project: until then it does not exist.
  const [folderExists, setFolderExists] = useState(true)
  const [selectedFile, setSelectedFile] = useState<IDropboxFolderEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [newFolderName, setNewFolderName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setEntries(null)
    setSelectedFile(null)
    setError(null)
    DropboxHelper.instance.listFolder(folder)
      .then((list) => {
        if (!cancelled) {
          setFolderExists(true)
          setEntries(list)
        }
      })
      .catch((listError) => {
        if (cancelled) {
          return
        }
        if (DropboxSyncError.from(listError).code === DropboxErrorCode.notFound) {
          setFolderExists(false)
          setEntries([])
        } else {
          setError(getDropboxErrorMessage(listError))
          setEntries([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [folder])

  const openFolder = (path: string) => {
    setNewFolderName(null)
    setFolder(path)
  }

  const handleCreateFolder = async (event?: FormEvent) => {
    event?.preventDefault()
    const name = newFolderName?.trim().replace(/[\\/]/g, ' ')
    if (!name) {
      return
    }
    setIsWorking(true)
    setError(null)
    try {
      const created = await DropboxHelper.instance.createFolder(`${folder}/${name}`)
      setNewFolderName(null)
      openFolder(created)
    } catch (createError) {
      setError(DropboxSyncError.from(createError).code === DropboxErrorCode.conflict ? `A folder named "${name}" already exists here.` : getDropboxErrorMessage(createError))
    } finally {
      setIsWorking(false)
    }
  }

  const handleOpenFile = async (entry: IDropboxFolderEntry | null = selectedFile) => {
    if (!entry?.fileId || !props.onPickFile || isWorking) {
      return
    }
    setIsWorking(true)
    setError(null)
    try {
      await props.onPickFile({ fileId: entry.fileId, path: entry.path, name: entry.name })
    } catch (openError) {
      setError(getDropboxErrorMessage(openError))
      setIsWorking(false)
    }
  }

  const visible = (entries ?? []).filter(entry => entry.kind === 'folder' || props.mode === 'file' || isProjectFile(entry))

  return (
    <>
      <Dialog.Title className="ui-title text-lg flex items-center gap-3">
        <DropboxIcon sizeClassName="w-9 h-9 rounded-[10px] text-base" />
        {props.mode === 'folder' ? 'Choose a folder' : 'Open a project from Dropbox'}
      </Dialog.Title>
      <p className="text-sm text-gray-600 mt-2">
        {props.mode === 'folder'
          ? 'The project is saved as a file in this folder of your Dropbox.'
          : 'Choose the file of an Anita project (.json): it is opened on this device and kept in sync with that file.'}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Breadcrumb
          folder={folder}
          onOpen={openFolder}
        />
        {props.mode === 'folder' && folderExists && newFolderName === null && (
          <Button
            id="dropboxNewFolder"
            label="New folder"
            iconLeft="addOutline"
            type={Type.secondary}
            size="sm"
            onClick={() => setNewFolderName('')}
            marginClassName=""
          />
        )}
      </div>

      {newFolderName !== null && (
        <form
          onSubmit={handleCreateFolder}
          className="mt-2 flex gap-2"
        >
          <input
            aria-label="Name of the new folder"
            placeholder="Name of the new folder"
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            className={`${FORM_ELEMENTS_CSS_CLASSES} grow px-3 py-1.5 text-sm`}
            autoFocus={true}
            disabled={isWorking}
          />
          <Button
            id="dropboxCreateFolder"
            label="Create"
            type={Type.primary}
            size="sm"
            disabled={isWorking || !newFolderName.trim()}
            onClick={() => handleCreateFolder()}
            marginClassName=""
          />
          <Button
            id="dropboxCancelFolder"
            label="Cancel"
            type={Type.secondary}
            size="sm"
            onClick={() => setNewFolderName(null)}
            marginClassName=""
          />
        </form>
      )}

      <div className="mt-3 h-72 overflow-y-auto rounded-xl border border-[#e1e8f1] bg-white">
        {entries === null && (
          <div className="h-full grid place-items-center"><Loader /></div>
        )}
        {entries !== null && !visible.length && (
          <div className="h-full grid place-items-center text-center px-6 text-sm text-[#7a8799]">
            <div>
              <span className="text-3xl">{Icons.render('folderOpenOutline')}</span>
              <p className="mt-1">
                {!folderExists
                  ? 'This folder does not exist yet: it is created when the first project is saved in it.'
                  : (props.mode === 'folder' ? 'No folders here.' : 'No files here.')}
              </p>
            </div>
          </div>
        )}
        {!!visible.length && (
          <ul className="divide-y divide-[#eef1f5]">
            {visible.map((entry) => {
              const selectable = entry.kind === 'folder' || (props.mode === 'file' && isProjectFile(entry))
              const selected = selectedFile?.path === entry.path
              return (
                <li key={entry.path}>
                  <button
                    type="button"
                    disabled={!selectable}
                    onClick={() => (entry.kind === 'folder' ? openFolder(entry.path) : setSelectedFile(entry))}
                    onDoubleClick={() => {
                      if (entry.kind === 'file' && selectable) {
                        setSelectedFile(entry)
                        handleOpenFile(entry)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition ${selected ? 'bg-[#eef4fc]' : ''} ${selectable ? (selected ? '' : 'hover:bg-[#f8fafc]') : 'opacity-50 cursor-default'}`}
                  >
                    <span className={`text-lg ${entry.kind === 'folder' ? 'text-[#0061fe]' : 'text-[#8a97a8]'}`}>
                      {Icons.render(entry.kind === 'folder' ? 'folderOutline' : 'documentTextOutline')}
                    </span>
                    <span className={`grow truncate ${selected ? 'font-semibold text-[#0b1f36]' : 'text-[#33445a]'}`}>{entry.name}</span>
                    {entry.kind === 'folder' && <span className="text-[#9aa7b8]">{Icons.render('chevronForwardOutline')}</span>}
                    {selected && <span className="text-[#006fdf]">{Icons.render('checkmarkOutline')}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <AlertWithDescription
            title={props.mode === 'folder' ? 'Something went wrong' : 'The project could not be opened'}
            description={error}
            type={Type.warning}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-y-2 mt-5">
        <Button
          id="dropboxPickerCancel"
          label="Cancel"
          type={Type.secondary}
          onClick={props.onClose}
        />
        {props.mode === 'folder'
          ? (
            <Button
              id="dropboxPickFolder"
              label={`Save in ${displayDropboxFolder(folder).split('/').pop() || 'Dropbox'}`}
              iconLeft="checkmarkOutline"
              type={Type.primary}
              disabled={entries === null || isWorking}
              onClick={() => props.onPickFolder?.(folder)}
              marginClassName=""
            />)
          : (
            <Button
              id="dropboxPickFile"
              label={isWorking ? 'Opening…' : 'Open project'}
              iconLeft="folderOpenOutline"
              type={Type.primary}
              disabled={!selectedFile || isWorking}
              onClick={() => handleOpenFile()}
              marginClassName=""
            />)}
      </div>
    </>
  )
}

/**
 * Browses the connected Dropbox to choose a folder or a project file.
 */
export const DropboxPicker: FC<IDropboxPickerProps> = (props) => (
  <Transition
    show={props.open}
    as={Fragment}
  >
    <Dialog
      as="div"
      className="relative z-30"
      onClose={props.onClose}
    >
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-[#000f20]/40 backdrop-blur-sm" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white border border-[#000f20]/5 p-5 sm:p-6 shadow-[0_30px_60px_-20px_rgba(0,35,70,0.45)]">
              {/* Unmounted when closed: each opening starts afresh. */}
              <PickerContent {...props} />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
)

/**
 * The Dropbox folder where a project will be saved, with a button to choose another one. '/' is the root.
 */
export const DropboxFolderField: FC<{ value: string; onChange: (folder: string) => void; id?: string }> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#0061fe]">{Icons.render('folderOutline')}</span>
      <span
        className="text-gray-600 min-w-0 truncate"
        title={displayDropboxFolder(props.value)}
      >
        Folder: <strong className="font-semibold text-[#0b1f36]">{displayDropboxFolder(props.value)}</strong>
      </span>
      <button
        type="button"
        id={props.id ?? 'changeDropboxFolder'}
        onClick={(event) => {
          // Inside a label: the click must not select the option again.
          event.preventDefault()
          setIsOpen(true)
        }}
        className="shrink-0 font-semibold text-[#006fdf] underline underline-offset-2 hover:text-[#0050a0]"
      >
        Change
      </button>
      <DropboxPicker
        open={isOpen}
        mode="folder"
        initialFolder={props.value === '/' ? '' : props.value}
        onClose={() => setIsOpen(false)}
        onPickFolder={(folder) => {
          // The root is '/': an empty value means the Anita folder.
          props.onChange(folder || '/')
          setIsOpen(false)
        }}
      />
    </div>
  )
}
