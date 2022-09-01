import { ANITA_URLS, URL_PARAMS } from 'app/libs/Routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/Routing/url-param-fillers.function'
import { RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { useClickOutside } from 'app/Components/hooks/click-outside.hook'
import React, { Fragment, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Icons } from 'app/libs/Icons/Icons.class'
import { Transition } from '@headlessui/react'

interface IProjectPickerProps {
  project: SystemData
}

export const ProjectPicker: React.FC<IProjectPickerProps> = ({ project }) => {
  const projects = useSelector((store: AnitaStore) => store.projects)
  const navigate = useNavigate()
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
    navigate(urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: projectId }]))
  }

  const loadProject = async (projectId: string) => {
    closeDropdown()
    await Manager.loadProjectById(projectId)
    goToDetails(projectId)
  }

  const goToEditProject = (projectId: string) => {
    closeDropdown()
    navigate(urlParamFiller(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: projectId }]))
  }

  return (
    <div className="block py-2.5 px-1">
      <p className="text-xs text-gray-400" style={{ fontVariant: 'small-caps' }}>project</p>
      <div ref={dropDownRef} x-data="{ dropdownOpen: true }" className="relative">
        <button onClick={() => toggleDropdown(dropdownOpen)} className="relative w-full flex justify-between text-left z-10 py-2 transition-all focus:px-2 hover:px-2 border-b hover:border-b-prussian-blue-700 hover:rounded focus:border-b-prussian-blue-700 active:border-b-prussian-blue-700 focus:outline-none hover:bg-gray-100 focus:bg-gray-200 focus:rounded active:bg-gray-300 active:rounded">
          <span>{project?.[RESERVED_AUDS_KEYS._settings][0]?.title}</span>
          {Icons.render('codeOutline', 'my-auto rotate-90')}
        </button>
        <Transition
          as={Fragment}
          show={dropdownOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-md overflow-hidden shadow-xl z-20 border border-bg-500">
            <div className="block py-2.5 px-4 text-sm bg-gray-100 text-gray-600">Current Project</div>
            <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => goToDetails(project[RESERVED_AUDS_KEYS._settings][0].id)}>
              {Icons.render('informationCircleOutline', 'mr-2')}
              Details
            </button>
            <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => goToEditProject(project[RESERVED_AUDS_KEYS._settings][0].id)}>
              {Icons.render('createOutline', 'mr-2')}
              Edit
            </button>
            {projects?.length > 1 && (<div className="block py-2.5 px-4 text-sm bg-gray-100 text-gray-600">Switch to Project</div>)}
            {projects?.map(projectFromList => {
              if (project[RESERVED_AUDS_KEYS._settings][0].id === projectFromList.id) return null
              return (
                <button key={projectFromList.id} className="w-full block text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => loadProject(projectFromList.id)}>{projectFromList.title}</button>)
            })}
            <div className="block py-2.5 px-4 text-sm bg-gray-100 text-gray-600">Actions</div>
            <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => navigate(ANITA_URLS.projectsList)}>
              {Icons.render('fileTrayStackedOutline', 'mr-2')}
              Go to the projects list
            </button>
            <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-800 border-b hover:bg-gray-200" onClick={() => navigate(ANITA_URLS.projectAdd)}>
              {Icons.render('addOutline', 'mr-2')}
              Create a new project
            </button>
          </div>
        </Transition>
      </div >
    </div >
  )
}
