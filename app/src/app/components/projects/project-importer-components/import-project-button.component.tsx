import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { Manager } from 'app/cross-refs-exports'
import { ProjectFileImporter, ProjectFileReadError } from 'app/libs/projects-helpers/project-importers/project-file-importer.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { useRef } from 'react'
import { ImportProjectModalContent } from 'app/components/projects/project-importer-components/import-project-modal-content.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import { useAtomValue } from 'jotai'
import { FormElesValidStateAtoms } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'
import { FormElementState } from 'app/state/form-element/form-element-state.class'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { LocalFileSync } from 'app/libs/cloud-sync/local-file/local-file-sync.class'
import { LOCAL_FILE_REMOTE_ID } from 'app/libs/cloud-sync/local-file/local-file.const'
import { LocalFileHelper } from 'app/libs/cloud-sync/local-file/local-file-helper.class'
import type { FC } from 'react'
import type { IProjectSettings, TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

interface IImportProjectButtonProps {
  /** icon: only the icon; compact: icon, with the label from md up; text: a large button with the label */
  btnType: 'icon' | 'compact' | 'text'
}

const showInvalidFileModal = () => {
  ModalState.showModal({
    title: 'This file cannot be imported',
    type: Type.danger,
    hideCancelButton: true,
    ctas: [{ actionText: 'OK' }],
    children: (
      <p className="text-sm text-gray-500">
        The file is not an Anita project. Export the project with &quot;Data and Structure&quot; (or &quot;Structure Only&quot;) and import that file: exports with &quot;Data Only&quot; do not contain the project structure.
      </p>
    ),
  })
}

const showUnreadableFileModal = (error: ProjectFileReadError) => {
  ModalState.showModal({
    title: error.reason === 'empty' ? 'This file is empty' : 'This file cannot be read',
    type: Type.danger,
    hideCancelButton: true,
    ctas: [{ actionText: 'OK' }],
    children: (
      <p className="text-sm text-gray-500">
        {error.reason === 'empty'
          ? <>&quot;{error.fileName}&quot; has no content, so there is nothing to import.</>
          : <>Your browser could not read &quot;{error.fileName}&quot;.</>}
        {' '}
        If it is in a cloud folder (iCloud Drive, Dropbox, OneDrive, Google Drive…) and is not available offline, download it to this computer first, then import it again.
      </p>
    ),
  })
}

/**
 * @feature import.file-sync
 * @title Keep an imported project in sync with its file
 * @summary When you import a project from a file of your computer, Anita can keep using that file, as it does with Dropbox or WordPress.
 * @where "Remote storage" of the "Import project" dialog, preselected on "A file on this computer (<file name>)", with a box explaining how it works.
 * @usage 1. Import a project from a file. 2. Leave "A file on this computer (<file name>)" in "Remote storage", or choose another storage. 3. Click "Import" and allow Anita to edit the file in the browser's prompt.
 * @options Keep the file (default), or choose "None: this device only" to import a copy saved only in this browser (the box under the field explains that changes are not written in the file, and that Dropbox or a WordPress site keep the project safe and on all devices), or Dropbox or a WordPress site.
 * @rules The file is not asked again: the one chosen with "Import" is used. Offered only in browsers that can use files on the computer (Chrome, Edge and other Chromium-based browsers on a computer); elsewhere the project is imported as a copy, as before. If the permission to edit the file is not granted, the project is imported and the project page asks for it again.
 * @errors localFile.permissionNeeded
 * @status beta
 * @since 1.0.0
 * @related import.file, sync.local-file-projects, storage.choice
 */

/**
 * @feature import.file
 * @title Import a project from a file
 * @summary Adds to this device a project saved in an Anita file (a JSON export), with its structure and its records.
 * @where "Import" button on the Projects screen, on the "Create a project" page and on the first project page.
 * @usage 1. Click "Import".
 * 2. Choose the .json file.
 * 3. In the "Import project" dialog check or change the name, description and remote storage (where the browser
 * supports it, the imported file is preselected: see "Keep an imported project in sync with its file").
 * 4. Click "Import".
 * @options Name, description and remote storage of the project can be changed before importing.
 * @rules Only files exported with "Data and Structure" or "Structure Only" can be imported. Any other file shows "This file
 * cannot be imported", explaining that exports with "Data Only" do not contain the project structure. An empty file
 * shows "This file is empty", and a file the browser cannot read "This file cannot be read": both suggest downloading
 * the file first when it is in a cloud folder and not available offline. Exports of the
 * previous version of Anita (0.20.0) can be imported. "Import" stays disabled while a required field is empty. The
 * project is saved in the browser of this device and the Projects list opens.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @related export.project, project.list, project.settings, import.file-sync
 */
export const ImportProjectButton: FC<IImportProjectButtonProps> = (props) => {
  const validObj = useAtomValue(FormElesValidStateAtoms.validState)
  const projectData = useRef<TAnitaUniversalDataStorage>(null)

  const handleClickImport = async () => {
    const projectSettings = FormElementState.getElement() as IProjectSettings
    const syncedFile = LocalFileSync.isLocalFileProject(projectSettings) ? LocalFileSync.getPendingFile(projectSettings.id) : undefined
    if (syncedFile) {
      // Asked now, while the click lets the browser show its prompt. If refused, the project page asks again.
      await LocalFileHelper.requestPermission(syncedFile)
    }
    projectData.current![RESERVED_AUDS_KEYS._settings][0] = { ...projectSettings, localStorage: LOCAL_STORAGE_SYSTEMS.IndexedDB }
    // Saving the project links it to the file, if kept in "Remote storage".
    await Manager.importProject(projectData.current!)
    Manager.setCurrentProject(projectData.current!)
    RoutingState.goTo(ANITA_URLS.projectsList)
  }

  const handleClickModal = async () => {
    let project: TAnitaUniversalDataStorage | undefined
    let fileHandle: FileSystemFileHandle | undefined
    try {
      const imported = await new ProjectFileImporter().import()
      project = imported?.project
      fileHandle = imported?.fileHandle
    } catch (error) {
      if (error instanceof ProjectFileReadError) {
        showUnreadableFileModal(error)
      } else {
        // Not valid JSON.
        showInvalidFileModal()
      }
      return
    }

    if (!project) {
      return
    }
    if (!project[RESERVED_AUDS_KEYS._settings]?.[0]?.id || !Array.isArray(project[RESERVED_AUDS_KEYS._sections])) {
      showInvalidFileModal()
      return
    }

    projectData.current = project
    const settings = project[RESERVED_AUDS_KEYS._settings][0]
    if (fileHandle) {
      // Kept in sync with the file it comes from, unless another storage is chosen in the dialog: the file is
      // already chosen, so it is not asked again.
      settings.remoteStorage = LOCAL_FILE_REMOTE_ID
      delete settings.remoteAccessLevel
      delete settings.dropboxFolder
      LocalFileSync.setPendingFile(settings.id, fileHandle)
    } else if (settings.remoteStorage === LOCAL_FILE_REMOTE_ID) {
      // Linked to a file only in the browser that saved it.
      delete settings.remoteStorage
    }
    const forgetFile = () => LocalFileSync.setPendingFile(settings.id, undefined)

    ModalState.showModal({
      title: 'Import project',
      type: Type.primary,
      ctas: [{
        actionText: 'Import',
        handleClickAction: handleClickImport,
        disableAction: Object.keys(validObj).some(key => validObj[key] === false),
      }],
      handleClickCancel: forgetFile,
      children: (
        <ImportProjectModalContent projectSettings={project[RESERVED_AUDS_KEYS._settings][0]} />
      ),
    })
  }

  if (props.btnType === 'compact') {
    return (
      <Button
        id="importProject"
        label="Import"
        tooltip="Import an existing project"
        breakpoint="md"
        iconLeft="downloadOutline"
        onClick={handleClickModal}
        type={Type.secondary}
        size="sm"
      />
    )
  }

  return (
    <Button
      id="importProject"
      label="Import an existing project"
      labelClassName={props.btnType === 'icon' ? 'hidden' : undefined}
      iconLeft={props.btnType === 'icon' ? 'downloadOutline' : undefined}
      onClick={handleClickModal}
      type={Type.secondary}
      size={props.btnType === 'text' ? 'lg' : 'sm'}
      className={props.btnType === 'text' ? 'w-full' : ''}
      hasTooltip={props.btnType === 'icon'}
    />
  )
}
