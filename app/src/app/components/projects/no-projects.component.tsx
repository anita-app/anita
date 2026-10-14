import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
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
      actions={<ImportProjectButton btnType="compact" />}
    />
    <TemplateGallery showBlankCard={true} />
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#7a8799] mt-8 mb-4">
      <Link
        to={ANITA_URLS.remotes}
        className="inline-flex items-center gap-1 hover:text-gray-800"
      >
        {Icons.render('logoWordpress')} I have projects on WordPress
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
        onWordPress={() => {
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
