import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Icons } from 'app/libs/icons/icons.class'
import { Link } from 'react-router-dom'
import type { FC } from 'react'

interface IProjectSectionNoDataProps {
  sectionTitle: string
  sectionId: string
  projectId: string
}

/**
 * Empty section: a sketch of a list with floating chips, as in the introduction, and the button to add the first record.
 */
export const ProjectSectionNoData: FC<IProjectSectionNoDataProps> = (props) => (
  <div className="container px-2 py-16 md:py-24 mx-auto">
    <div className="ui-card ui-rise lg:w-2/3 mx-auto px-8 py-12 text-center">
      <div
        className="ui-empty-art"
        aria-hidden="true"
      >
        <div className="ui-empty-sheet">
          <div
            className="ui-empty-line"
            style={{ width: '60%' }}
          />
          <div className="ui-empty-line" />
          <div
            className="ui-empty-line"
            style={{ width: '80%' }}
          />
        </div>
        <span
          className="ui-float-chip max-w-[10rem]"
          style={{ left: 0, top: '0.25rem' }}
        >
          {Icons.render('documentTextOutline')} <span className="truncate">{props.sectionTitle}</span>
        </span>
        <span
          className="ui-float-chip"
          style={{ right: 0, bottom: '0.5rem', animationDelay: '-2s' }}
        >
          {Icons.render('addOutline')} New
        </span>
      </div>
      <p className="ui-eyebrow mt-4">Nothing here yet</p>
      <h1 className="ui-title text-xl sm:text-2xl mt-1 mb-2">There are no items in {props.sectionTitle}</h1>
      <p className="text-[#5b6b80]">Create a new entry to populate this list</p>
      <Link
        to={urlParamFiller(ANITA_URLS.projectSectionAddEle, [{ name: URL_PARAMS.projectId, value: props.projectId }, { name: URL_PARAMS.sectionId, value: props.sectionId }])}
        className="ui-btn ui-btn-primary ui-btn-shine inline-flex items-center gap-2 rounded-xl px-5 py-3 mt-7 font-semibold"
      >
        {Icons.render('addOutline')} Create a new entry
      </Link>
    </div>
  </div>
)
