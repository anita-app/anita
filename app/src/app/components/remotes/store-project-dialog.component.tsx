import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useAtomValue } from 'jotai'
import { Icons } from 'app/libs/icons/icons.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { StorageChoice, defaultStorageChoice, useWritableRemotes } from 'app/components/remotes/storage-choice.component'
import { getConnectionErrorMessage } from 'app/components/remotes/connect-wordpress.component'
import { useDropboxIsWritable } from 'app/components/remotes/dropbox-icon.component'
import { checkSiteOfStorageChoice, storageChoiceNeedsLogin, storeProject } from 'app/libs/cloud-sync/store-project.function'
import { WordPressAuth } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import { getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'
import { getLocalFileErrorMessage } from 'app/libs/cloud-sync/local-file/local-file-error.class'
import { OnboardingAtoms } from 'app/state/onboarding/onboarding.atoms'
import { OnboardingState } from 'app/state/onboarding/onboarding-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import type { FC } from 'react'
import type { TStorageChoice } from 'app/components/remotes/storage-choice.component'

const Benefit: FC<{ icon: 'shieldCheckmarkOutline' | 'phonePortraitOutline' | 'peopleOutline'; text: string }> = (props) => (
  <li className="flex items-center gap-2 text-sm text-gray-700">
    <span className="text-green-600">{Icons.render(props.icon)}</span>
    {props.text}
  </li>
)

/**
 * Message for an error while storing a project as chosen.
 * @featurePart storage.choice
 */
export const getStoreErrorMessage = (error: unknown, choice: TStorageChoice, siteName: string | undefined): string => {
  switch (choice.kind) {
    case 'connect':
      return getConnectionErrorMessage(error, WordPressAuth.normalizeSiteUrl(choice.siteUrl || 'your site'))
    case 'dropbox':
      return getDropboxErrorMessage(error)
    case 'localFile':
      return getLocalFileErrorMessage(error, choice.handle.name)
    case 'remote':
      return getWordPressErrorMessage(error, siteName ?? 'the site')
    default:
      return (error as Error).message
  }
}

/**
 * Label of the button that stores a project as chosen.
 * @featurePart storage.choice
 */
export const storeActionLabel = (choice: TStorageChoice, siteName: string | undefined): string => {
  switch (choice.kind) {
    case 'connect':
      return 'Connect and save'
    case 'dropbox':
      return storageChoiceNeedsLogin(choice) ? 'Connect Dropbox and save' : 'Save in Dropbox'
    case 'localFile':
      return 'Save in the file'
    case 'remote':
      return `Save on ${siteName ?? 'WordPress'}`
    default:
      return 'Save'
  }
}

const StoreProjectForm: FC<{ projectId: string; projectTitle: string }> = (props) => {
  const remotes = useWritableRemotes()
  const dropboxIsWritable = useDropboxIsWritable()
  const [choice, setChoice] = useState<TStorageChoice>(() => defaultStorageChoice(remotes, false, dropboxIsWritable))
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const siteName = choice.kind === 'remote' ? remotes.find(remote => remote.remoteId === choice.remoteId)?.data.site_name : undefined

  const handleStore = async () => {
    setError(null)
    setIsWorking(true)
    try {
      const leavesApp = storageChoiceNeedsLogin(choice)
      const site = await checkSiteOfStorageChoice(choice)
      await storeProject(props.projectId, choice, site)
      if (!leavesApp) {
        OnboardingState.closeStoreProject()
      }
    } catch (storeError) {
      setError(getStoreErrorMessage(storeError, choice, siteName))
      setIsWorking(false)
    }
  }

  return (
    <>
      <p className="text-sm text-gray-600">&quot;{props.projectTitle}&quot; is saved only in this browser. Save it in Dropbox, on a WordPress site, or in a file on this computer:</p>
      <ul className="mt-3 space-y-1">
        <Benefit
          icon="shieldCheckmarkOutline"
          text="it is backed up in your Dropbox or in your site's database"
        />
        <Benefit
          icon="phonePortraitOutline"
          text="you can use it from all your devices, also offline"
        />
        <Benefit
          icon="peopleOutline"
          text="on WordPress, you can share it with the users of the site"
        />
      </ul>
      <div className="mt-4">
        <StorageChoice
          value={choice}
          onChange={setChoice}
          allowLocal={false}
          projectTitle={props.projectTitle}
        />
      </div>
      {error && (
        <div className="mt-3">
          <AlertWithDescription
            title="The project was not saved"
            description={error}
            type={Type.warning}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-end gap-y-2 mt-5">
        <Button
          id="storeProjectLater"
          label="Not now"
          type={Type.secondary}
          onClick={OnboardingState.closeStoreProject}
        />
        <Button
          id="storeProject"
          label={isWorking ? 'Saving…' : storeActionLabel(choice, siteName)}
          iconLeft={choice.kind === 'dropbox' ? 'logoDropbox' : (choice.kind === 'localFile' ? 'desktopOutline' : 'logoWordpress')}
          type={Type.primary}
          disabled={isWorking}
          onClick={handleStore}
          marginClassName=""
        />
      </div>
    </>
  )
}

/**
 * Dialog to move a project saved only on this device to Dropbox or to a WordPress site.
 * Opened with OnboardingState.openStoreProject.
 * @featurePart storage.choice, storage.local-only
 */
export const StoreProjectDialog: FC = () => {
  const projectId = useAtomValue(OnboardingAtoms.storeProjectId)
  const project = useAtomValue(ProjectsListAtoms.projects).find(item => item.id === projectId)
  const [shownProject, setShownProject] = useState(project)

  // Keeps the content during the closing animation.
  useEffect(() => {
    if (project) {
      setShownProject(project)
    }
  }, [project])

  return (
    <Transition
      show={!!project}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-20"
        onClose={OnboardingState.closeStoreProject}
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
                <Dialog.Title className="ui-title text-lg flex items-center gap-3">
                  <span className="ui-avatar w-9 h-9 rounded-[10px] text-lg">{Icons.render('shieldCheckmarkOutline')}</span>
                  Keep your project safe
                </Dialog.Title>
                <div className="mt-3">
                  {shownProject && (
                    <StoreProjectForm
                      key={shownProject.id}
                      projectId={shownProject.id}
                      projectTitle={shownProject.title}
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
