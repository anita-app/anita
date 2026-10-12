import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useAtomValue } from 'jotai'
import { Icons } from 'app/libs/icons/icons.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { StorageChoice, defaultStorageChoice, useWritableRemotes } from 'app/components/remotes/storage-choice.component'
import { getConnectionErrorMessage } from 'app/components/remotes/connect-wordpress.component'
import { checkSiteOfStorageChoice, storeProject } from 'app/libs/cloud-sync/wordpress/store-project.function'
import { WordPressAuth } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
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

const StoreOnWordPressForm: FC<{ projectId: string; projectTitle: string }> = (props) => {
  const remotes = useWritableRemotes()
  const [choice, setChoice] = useState<TStorageChoice>(() => defaultStorageChoice(remotes, false))
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStore = async () => {
    setError(null)
    setIsWorking(true)
    try {
      const site = await checkSiteOfStorageChoice(choice)
      await storeProject(props.projectId, choice, site)
      if (choice.kind !== 'connect') {
        OnboardingState.closeStoreOnWordPress()
      }
    } catch (storeError) {
      setError(choice.kind === 'connect'
        ? getConnectionErrorMessage(storeError, WordPressAuth.normalizeSiteUrl(choice.siteUrl || 'your site'))
        : getWordPressErrorMessage(storeError, remotes.find(remote => choice.kind === 'remote' && remote.remoteId === choice.remoteId)?.data.site_name ?? 'the site'))
      setIsWorking(false)
    }
  }

  const siteName = choice.kind === 'remote' ? remotes.find(remote => remote.remoteId === choice.remoteId)?.data.site_name : undefined

  return (
    <>
      <p className="text-sm text-gray-600">&quot;{props.projectTitle}&quot; is saved only in this browser. Save it on a WordPress site:</p>
      <ul className="mt-3 space-y-1">
        <Benefit
          icon="shieldCheckmarkOutline"
          text="it is backed up in your site's database"
        />
        <Benefit
          icon="phonePortraitOutline"
          text="you can use it from all your devices, also offline"
        />
        <Benefit
          icon="peopleOutline"
          text="you can share it with the users of the site"
        />
      </ul>
      <div className="mt-4">
        <StorageChoice
          value={choice}
          onChange={setChoice}
          allowLocal={false}
        />
      </div>
      {error && (
        <div className="mt-3">
          <AlertWithDescription
            title="The project was not saved on WordPress"
            description={error}
            type={Type.warning}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-end gap-y-2 mt-5">
        <Button
          id="storeOnWordPressLater"
          label="Not now"
          type={Type.secondary}
          onClick={OnboardingState.closeStoreOnWordPress}
        />
        <Button
          id="storeOnWordPress"
          label={isWorking ? 'Saving…' : (choice.kind === 'connect' ? 'Connect and save' : `Save on ${siteName ?? 'WordPress'}`)}
          iconLeft="logoWordpress"
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
 * Dialog to move a project saved only on this device to a WordPress site. Opened with OnboardingState.openStoreOnWordPress.
 */
export const StoreOnWordPressDialog: FC = () => {
  const projectId = useAtomValue(OnboardingAtoms.storeOnWordPressProjectId)
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
        onClose={OnboardingState.closeStoreOnWordPress}
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
          <div className="fixed inset-0 bg-gray-500/75" />
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
              <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-5 sm:p-6 shadow-xl">
                <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <span className="text-prussian-blue-400">{Icons.render('logoWordpress')}</span>
                  Keep your project safe
                </Dialog.Title>
                <div className="mt-3">
                  {shownProject && (
                    <StoreOnWordPressForm
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
