import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { TemplateGallery } from 'app/components/templates/template-gallery.component'
import { Icons } from 'app/libs/icons/icons.class'
import { Navigate, Link } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC, ReactNode } from 'react'
import type { TIconName } from 'app/libs/icons/icons.class'

const Step: FC<{ number: number; icon: TIconName; title: string; children: ReactNode }> = (props) => (
  <div className="flex gap-3">
    <span className="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center text-lg">{Icons.render(props.icon)}</span>
    <div>
      <p className="font-medium">{props.number}. {props.title}</p>
      <p className="text-sm text-white/75">{props.children}</p>
    </div>
  </div>
)

/**
 * Welcome page, shown when there are no projects on this device.
 */
export const ProjectsNone: FC = () => {
  const projects = useAtomValue(ProjectsListAtoms.projects)
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)

  if (projects?.length > 0) {
    return (
      <Navigate to={ANITA_URLS.projectsList} />
    )
  }

  const scrollToTemplates = () => {
    document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-2xl bg-prussian-blue-500 text-white px-6 py-10 md:px-12 md:py-14 shadow">
        <div
          className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div
          className="absolute right-24 -bottom-32 w-72 h-72 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div className="relative">
          <img
            src={`${process.env.PUBLIC_URL}/assets/logo/logo_square.svg`}
            alt=""
            className="h-12 w-auto mb-6 rounded-lg bg-white p-1"
          />
          <h1 className="text-3xl md:text-4xl font-semibold">Welcome to Anita</h1>
          <p className="text-lg text-white/85 mt-3 max-w-2xl">Organize anything you need to keep track of: tasks, clients, books, recipes, trips… Everything starts from a project.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 max-w-4xl">
            <Step
              number={1}
              icon="albumsOutline"
              title="Pick a template"
            >
              Ready-made sections and fields, or design your own.
            </Step>
            <Step
              number={2}
              icon="createOutline"
              title="Add your records"
            >
              Fill in your data, filter it, link records together.
            </Step>
            <Step
              number={3}
              icon="logoWordpress"
              title="Keep it safe"
            >
              Save it on your WordPress site to back it up and share it.
            </Step>
          </div>

          <div className="flex flex-wrap gap-3 mt-10">
            <button
              type="button"
              onClick={scrollToTemplates}
              className="inline-flex items-center gap-2 rounded-md bg-white text-prussian-blue-500 font-medium px-5 py-3 hover:bg-gray-100"
            >
              {Icons.render('albumsOutline')} Choose a template
            </button>
            <Link
              to={ANITA_URLS.projectAdd}
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 font-medium hover:bg-white/10"
            >
              {Icons.render('addOutline')} Start from scratch
            </Link>
            {!remotes.length && (
              <Link
                to={ANITA_URLS.remotes}
                className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 font-medium hover:bg-white/10"
              >
                {Icons.render('logoWordpress')} I have projects on WordPress
              </Link>
            )}
          </div>
        </div>
      </section>

      <section
        id="templates"
        className="mt-10 scroll-mt-4"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Choose a template</h2>
            <p className="text-gray-600 mt-1">Everything is set up in a click. You can change sections and fields whenever you want.</p>
          </div>
          <div className="shrink-0">
            <ImportProjectButton btnType="text" />
          </div>
        </div>
        <TemplateGallery showBlankCard={true} />
      </section>
    </div>
  )
}
