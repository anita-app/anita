import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { Link } from 'react-router-dom'
import { Icons } from 'app/libs/icons/icons.class'
import { useShortcut } from 'app/components/hooks/shortcut'
import { RoutingState } from 'app/state/routing/routing-state.class'
import type { FC } from 'react'
import type { TIconName } from 'app/libs/icons/icons.class'

interface IAddElementButtonProps {
  projectId: string
  sectionId: string
  mode: EDITOR_MODE.add
  elementId?: never
}

interface IEditElementButtonProps {
  projectId: string
  sectionId: string
  elementId: string
  mode: EDITOR_MODE.edit
}

type IAddEditElementButtonProps = | IAddElementButtonProps | IEditElementButtonProps;

export const AddEditElementButton: FC<IAddEditElementButtonProps> = (props) => {
  const icon: TIconName = props.mode === EDITOR_MODE.add ? 'addOutline' : 'createOutline'
  const urlParamsToFill = [{ name: URL_PARAMS.projectId, value: props.projectId }, { name: URL_PARAMS.sectionId, value: props.sectionId }]
  if (props.mode === EDITOR_MODE.edit) {
    urlParamsToFill.push({ name: URL_PARAMS.elementId, value: props.elementId as string })
  }

  const urlToFill = props.mode === EDITOR_MODE.add ? ANITA_URLS.projectSectionAddEle : ANITA_URLS.projectSectionEditEle

  const url: string = urlParamFiller(urlToFill, urlParamsToFill)

  const navigateOnShortcut = (e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    RoutingState.goTo(url)
  }

  const key: 'c' | 'e' = props.mode === EDITOR_MODE.add ? 'c' : 'e'

  useShortcut({ key, callback: navigateOnShortcut })

  const label = props.mode === EDITOR_MODE.add ? 'New record' : 'Edit record'

  return (
    <div className="ui-fab-wrap ui-pop absolute bottom-5 right-7 md:bottom-7 md:right-10 z-10 flex items-center gap-3">
      {/* The label with the shortcut appears on hover and on keyboard focus. */}
      <span
        className="ui-fab-tip"
        aria-hidden="true"
      >
        {label} <span className="ui-kbd">{key.toUpperCase()}</span>
      </span>
      <Link
        to={url}
        aria-label={label}
        className={`ui-fab ${props.mode === EDITOR_MODE.add ? 'ui-fab-add' : ''}`}
      >
        {Icons.render(icon)}
      </Link>
    </div>
  )
}
