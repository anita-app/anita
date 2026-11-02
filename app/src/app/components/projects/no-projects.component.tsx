import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { OpenFromDropboxButton } from 'app/components/remotes/open-from-dropbox-button.component'
import { TemplateGallery } from 'app/components/templates/template-gallery.component'
import { Onboarding, isOnboardingDone, markOnboardingDone } from 'app/components/onboarding/onboarding.component'
import { Icons } from 'app/libs/icons/icons.class'
import { PageHeader } from 'app/components/shared-components/common-ui-eles/page-header.component'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import type { FC } from 'react'

/**
 * Template gallery for the first project.
 */
const FirstProjectTemplates: FC<{ onShowIntro: () => void }> = (props) => (
  <div className="max-w-7xl mx-auto animate__animated animate__fadeIn">
    <PageHeader
      eyebrow="Your first project"
      title="Choose a template"
      description="Everything is set up in a click. You can change sections and fields whenever you want."
      actions={(
        <>
          <OpenFromDropboxButton breakpoint="md" />
          <ImportProjectButton btnType="compact" />
        </>
      )}
    />
    <TemplateGallery showBlankCard={true} />
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#7a8799] mt-8 mb-4">
      <Link
        to={ANITA_URLS.remotes}
        className="inline-flex items-center gap-1 hover:text-gray-800"
      >
        {Icons.render('cloudDownloadOutline')} I have projects in Dropbox or on WordPress
      </Link>
      <button
        type="button"
        onClick={props.onShowIntro}
        className="inline-flex items-center gap-1 hover:text-gray-800"
      >
        {Icons.render('playCircleOutline')} Show the introduction again
      </button>
    </div>
  </div>
)

/**
 * Shown when there are no projects on this device: the introduction the first time, then the templates.
 *
 * @feature project.first-project
 * @title Create your first project
 * @summary When there are no projects on this device, the app shows the introduction and then the templates to create the first one.
 * @where Shown automatically when this device has no projects: "Your first project" / "Choose a template".
 * @usage 1. Go through the introduction (only the first time).
 * 2. Pick a template, or "Start from scratch".
 * 3. Or bring existing projects: "Open from Dropbox", "Import", or the link "I have projects in Dropbox or on WordPress".
 * @options "Show the introduction again" link at the bottom of the page.
 * @rules The introduction is shown until you choose how to start; afterwards this page opens directly on the templates. As soon
 * as there is a project on the device the app goes to the Projects list.
 * @errors none
 * @status stable
 * @since 1.0.0
 * @routes projectsNone
 * @related app.onboarding, template.gallery, template.create-project, import.file
 */
export const ProjectsNone: FC = () => {
  const projects = useAtomValue(ProjectsListAtoms.projects)
  const [view, setView] = useState<'intro' | 'templates'>(() => (isOnboardingDone() ? 'templates' : 'intro'))

  if (projects?.length > 0) {
    return (
      <Navigate to={ANITA_URLS.projectsList} />
    )
  }

  if (view === 'intro') {
    return (
      <Onboarding
        onTemplates={() => {
          markOnboardingDone()
          setView('templates')
        }}
        onImport={() => {
          markOnboardingDone()
          RoutingState.navigate(ANITA_URLS.remotes)
        }}
        onScratch={() => {
          markOnboardingDone()
          RoutingState.navigate(ANITA_URLS.projectAdd)
        }}
      />
    )
  }

  return <FirstProjectTemplates onShowIntro={() => setView('intro')} />
}
