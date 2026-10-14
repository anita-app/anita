import { Fragment, useRef, useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { Manager } from 'app/cross-refs-exports'
import { useClickOutside } from 'app/components/hooks/click-outside.hook'
import { Icons } from 'app/libs/icons/icons.class'
import { Transition } from '@headlessui/react'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { useAtomValue } from 'jotai'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { ProjectAvatar } from 'app/components/shared-components/common-ui-eles/project-avatar.component'
import type { FC } from 'react'
import type { TSystemData } from 'app/models/project/project.declarations'

interface IProjectPickerProps {
  project: TSystemData
  sectionsCount: number
}

export const AdminLayoutSidebarProjectPicker: FC<IProjectPickerProps> = (props) => {
  const projects = useAtomValue(ProjectsListAtoms.projects)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropDownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropDownRef, () => setDropdownOpen(false))

  const closeDropdown = () => {
    (document.activeElement as HTMLDivElement)?.blur?.()
    setDropdownOpen(!dropdownOpen)
  }

  const toggleDropdown = (currentValue: boolean) => {
    const newValue = !currentValue
    if (!newValue) {
      closeDropdown()
    } else {
      setDropdownOpen(newValue)
    }
  }

  const goToDetails = (projectId: string) => {
    closeDropdown()
    RoutingState.goTo(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: projectId }])
  }

  const loadProject = async (projectId: string) => {
    closeDropdown()
    await Manager.loadProjectById(projectId)
    goToDetails(projectId)
  }

  const goToEditProject = (projectId: string) => {
    closeDropdown()
    RoutingState.goTo(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: projectId }])
  }

  const goToPlainRoute = (route: string) => {
    closeDropdown()
    RoutingState.goTo(route)
  }

  const currentId = props.project[RESERVED_AUDS_KEYS._settings][0].id
  const currentTitle = props.project?.[RESERVED_AUDS_KEYS._settings][0]?.title

  return (
    <div className="block pt-2 pb-1">
      <div
        ref={dropDownRef}
        className="relative"
      >
        <button
          onClick={() => toggleDropdown(dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
          className="ui-picker relative z-10 w-full flex items-center gap-2.5 text-left px-2 py-2"
        >
          <ProjectAvatar
            title={currentTitle}
            id={currentId}
          />
          <span className="min-w-0 grow">
            <span className="block truncate text-sm font-semibold text-[#0b1f36] leading-tight">{currentTitle}</span>
            <span className="block text-[0.7rem] text-[#7a8799]">{props.sectionsCount} {props.sectionsCount === 1 ? 'section' : 'sections'}</span>
          </span>
          {Icons.render('codeOutline', 'my-auto rotate-90 text-[#8a97a8] shrink-0')}
        </button>
        <Transition
          as={Fragment}
          show={dropdownOpen}
          enter="transition ease-out duration-150"
          enterFrom="transform opacity-0 scale-95 -translate-y-1"
          enterTo="transform opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="ui-menu absolute left-0 mt-2 w-64 z-20 origin-top-left">
            <div className="ui-menu-label">Current project</div>
            <button
              className="ui-menu-item ui-active"
              onClick={() => goToDetails(currentId)}
            >
              <ProjectAvatar
                title={currentTitle}
                id={currentId}
                size="small"
              />
              <span className="truncate grow">{currentTitle}</span>
              {Icons.render('checkmarkOutline', 'text-[#006fdf] shrink-0')}
            </button>
            <button
              className="ui-menu-item"
              onClick={() => goToDetails(currentId)}
            >
              <span className="ui-menu-tile">{Icons.render('informationCircleOutline')}</span>
              <span>Details</span>
            </button>
            <button
              className="ui-menu-item"
              onClick={() => goToEditProject(currentId)}
            >
              <span className="ui-menu-tile">{Icons.render('createOutline')}</span>
              <span>Edit</span>
            </button>
            {projects?.length > 1 && (
              <>
                <div className="ui-menu-sep" />
                <div className="ui-menu-label">Switch to</div>
              </>
            )}
            {projects?.map(projectFromList => {
              if (currentId === projectFromList.id) return null
              return (
                <button
                  key={projectFromList.id}
                  className="ui-menu-item"
                  onClick={() => loadProject(projectFromList.id)}
                >
                  <ProjectAvatar
                    title={projectFromList.title}
                    id={projectFromList.id}
                    size="small"
                  />
                  <span className="truncate">{projectFromList.title}</span>
                </button>)
            })}
            <div className="ui-menu-sep" />
            <button
              className="ui-menu-item"
              onClick={() => goToPlainRoute(ANITA_URLS.projectsList)}
            >
              <span className="ui-menu-tile">{Icons.render('fileTrayStackedOutline')}</span>
              <span>Go to the projects list</span>
            </button>
            <button
              className="ui-menu-item"
              onClick={() => goToPlainRoute(ANITA_URLS.projectNew)}
            >
              <span className="ui-menu-tile">{Icons.render('addOutline')}</span>
              <span>Create a new project</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  )
}
