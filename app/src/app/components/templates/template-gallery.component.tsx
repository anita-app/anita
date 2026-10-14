import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from 'app/libs/icons/icons.class'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { TemplatesCatalog } from 'app/libs/templates/templates-catalog.class'
import type { CSSProperties, FC } from 'react'
import type { ILoadedCatalog, IProjectTemplate } from 'app/libs/templates/templates-catalog.class'
import type { TIconName } from 'app/libs/icons/icons.class'

/**
 * Accent colors of the categories, in order. Full class names, so Tailwind keeps them.
 */
const ACCENTS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-pink-100 text-pink-700',
  'bg-red-100 text-red-700',
  'bg-indigo-100 text-indigo-700',
  'bg-yellow-100 text-yellow-800',
  'bg-cyan-100 text-cyan-700',
]

export const templateUrl = (templateId: string): string => urlParamFiller(ANITA_URLS.projectNewFromTemplate, [{ name: URL_PARAMS.templateId, value: templateId }])

export const TemplateIcon: FC<{ icon?: TIconName; accent: string; sizeClassName?: string }> = (props) => (
  <span className={`${props.sizeClassName ?? 'w-10 h-10 text-xl'} rounded-xl flex items-center justify-center shrink-0 ${props.accent}`}>
    {Icons.render(props.icon ?? 'documentTextOutline')}
  </span>
)

export const useTemplatesCatalog = () => {
  const [state, setState] = useState<{ loaded?: ILoadedCatalog; error?: boolean }>({})
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    TemplatesCatalog.load()
      .then(loaded => {
        if (!cancelled) setState({ loaded })
      })
      .catch(() => {
        if (!cancelled) setState({ error: true })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  return {
    ...state,
    retry: () => {
      setState({}); setAttempt(attempt + 1)
    },
  }
}

export const accentOfCategory = (categoryIds: Array<string>, categoryId: string): string => {
  const index = categoryIds.indexOf(categoryId)
  return ACCENTS[(index < 0 ? 0 : index) % ACCENTS.length]
}

/** Templates after this one appear together, so long lists do not wait. */
const MAX_ENTRANCE_DELAY_STEPS = 12

const TemplateCard: FC<{ template: IProjectTemplate; accent: string; categoryLabel?: string; index: number }> = (props) => (
  <Link
    to={templateUrl(props.template.id)}
    className="ui-gcard ui-rise group flex flex-col p-4"
    style={{ '--d': Math.min(props.index, MAX_ENTRANCE_DELAY_STEPS) } as CSSProperties}
  >
    <div className="flex items-start gap-3">
      <TemplateIcon
        icon={props.template.icon}
        accent={props.accent}
      />
      <div className="min-w-0">
        <h3 className="font-semibold text-[#0b1f36] group-hover:text-[#006fdf] transition-colors">{props.template.title}</h3>
        {props.categoryLabel && <p className="text-xs text-[#7a8799]">{props.categoryLabel}</p>}
      </div>
      <span className="ml-auto text-[#006fdf] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition">{Icons.render('arrowForwardOutline')}</span>
    </div>
    <p className="text-sm text-[#5b6b80] mt-3 grow">{props.template.description}</p>
    <p className="text-xs text-[#7a8799] mt-3 pt-3 border-t border-[#eef1f5]">
      {props.template.sections.map(section => section.title).join(' · ')}
    </p>
  </Link>
)

interface ITemplateGalleryProps {
  /** Shows a "Start from scratch" card first. */
  showBlankCard?: boolean
}

/**
 * Searchable gallery of the project templates, grouped by category.
 */
export const TemplateGallery: FC<ITemplateGalleryProps> = (props) => {
  const { loaded, error, retry } = useTemplatesCatalog()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const catalog = loaded?.catalog
  const categoryIds = useMemo(() => catalog?.categories.map(item => item.id) ?? [], [catalog])
  const categoryLabels = useMemo(() => Object.fromEntries((catalog?.categories ?? []).map(item => [item.id, item.label])), [catalog])

  const visibleTemplates = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    return (catalog?.templates ?? []).filter(template => (
      (category === 'all' || template.category === category) &&
      words.every(word => TemplatesCatalog.searchableText(template).includes(word))
    ))
  }, [catalog, query, category])

  if (error) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#c3d0e0] bg-white/60 p-6 text-center text-[#5b6b80]">
        <p>The templates could not be downloaded. Check your connection and try again, or start from scratch.</p>
        <div className="mt-4 flex justify-center flex-wrap gap-2">
          <Button
            id="retryTemplates"
            label="Try again"
            type={Type.secondary}
            onClick={retry}
            marginClassName=""
          />
          <Button
            id="blankProjectFromError"
            label="Start from scratch"
            type={Type.primary}
            href={ANITA_URLS.projectAdd}
            marginClassName=""
          />
        </div>
      </div>
    )
  }

  if (!catalog) {
    return <Loader />
  }

  const countByCategory = (categoryId: string) => catalog.templates.filter(template => template.category === categoryId).length

  return (
    <div>
      <div className="flex flex-col gap-3 mb-5">
        <div className="relative md:w-80 shrink-0">
          <span className="absolute left-3 top-2.5 text-[#8a97a8] z-10">{Icons.render('searchOutline')}</span>
          <input
            type="search"
            placeholder="Search templates"
            aria-label="Search templates"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${FORM_ELEMENTS_CSS_CLASSES} w-full pl-9 pr-3 py-2 text-sm`}
          />
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:flex-wrap md:overflow-visible"
          role="tablist"
          aria-label="Categories"
        >
          {[{ id: 'all', label: 'All', count: catalog.templates.length }, ...catalog.categories.map(item => ({ id: item.id, label: item.label, count: countByCategory(item.id) }))]
            .filter(item => item.count > 0)
            .map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={category === item.id}
                onClick={() => setCategory(item.id)}
                className={`ui-btn shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold border ${category === item.id ? 'ui-btn-primary border-transparent text-white' : 'bg-white border-[#dfe5ee] text-[#33445a] hover:border-[#c4d2e3] hover:bg-[#f9fbfe]'}`}
              >
                {item.label}
                <span className={`ml-1.5 ${category === item.id ? 'text-white/70' : 'text-[#9aa7b8]'}`}>{item.count}</span>
              </button>
            ))}
        </div>
      </div>

      {loaded?.fromCache && (
        <p className="text-xs text-[#7a8799] mb-3">You are offline: showing the templates saved on this device.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {props.showBlankCard && category === 'all' && !query && (
          <Link
            to={ANITA_URLS.projectAdd}
            className="ui-rise group flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#c3d0e0] bg-white/60 p-4 text-center hover:border-[#2d96ff] hover:bg-white hover:shadow-[0_0_0_3px_rgba(45,150,255,0.1)] transition min-h-[10rem]"
          >
            <span className="w-11 h-11 rounded-full grid place-items-center text-2xl text-[#8a97a8] bg-[#eef2f7] transition group-hover:text-white group-hover:bg-[#006fdf] group-hover:rotate-90 group-hover:shadow-[0_8px_18px_-8px_rgba(0,111,223,0.7)]">{Icons.render('addOutline')}</span>
            <h3 className="font-semibold text-[#0b1f36] mt-3">Start from scratch</h3>
            <p className="text-sm text-[#5b6b80] mt-1">Design your own sections and fields.</p>
          </Link>
        )}
        {visibleTemplates.map((template, index) => (
          <TemplateCard
            key={template.id}
            index={index + 1}
            template={template}
            accent={accentOfCategory(categoryIds, template.category)}
            categoryLabel={category === 'all' ? categoryLabels[template.category] : undefined}
          />
        ))}
      </div>

      {!visibleTemplates.length && (
        <p className="text-center text-[#5b6b80] py-8">No template matches your search. Try other words, or start from scratch.</p>
      )}
    </div>
  )
}
