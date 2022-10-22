import { Transition } from '@headlessui/react'
import { ISharedFileMeta } from 'app/libs/cloud-sync/cloud-sync.const'
import { Icons } from 'app/libs/icons/icons.class'
import React, { useEffect, useRef, useState } from 'react'

interface IFileExplorerProps {
  files: Array<ISharedFileMeta>
  selected: ISharedFileMeta | null
  onSelecteItem: (file: ISharedFileMeta) => void
  onNavigateToFolder: (path: string) => void
}

const SUPPORTED_EXTENSIONS = ['json', 'db']

export const FileExplorer: React.FC<IFileExplorerProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(false)

  useEffect(() => {
    // scroll containerRef.current to top
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [props.files])

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current!
        setIsScrollAtBottom(scrollTop + clientHeight >= scrollHeight - 40)
      }
      if (containerRef.current) {
        containerRef.current.addEventListener('scroll', handleScroll)
      }
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('scroll', handleScroll)
        }
      }
    })
  }, [])

  return (
    <div className="relative">
      <div ref={containerRef} className="bg-white max-h-96 overflow-y-auto pr-2">
        <Transition
          show={!!props.files.length}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ul role="list" className="divide-y divide-gray-200 border rounded-md">
            {props.files
              .filter((file) => file.type === 'folder' || SUPPORTED_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() || ''))
              .map((file) => (
                <li key={file.id}>
                  <button className="w-full leading-none">
                    <div className="flex items-center">
                      <div
                        className={`py-4 pl-4 min-w-0 flex-1 sm:flex sm:items-center sm:justify-between ${props.selected?.id === file.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => props.onSelecteItem(file)}
                      >
                        <div className="truncate">
                          <div className="flex text-sm">
                            <i className="mr-3">{Icons.render(file.type === 'file' ? 'documentOutline' : 'folderOutline')}</i><p className="truncate font-medium text-gray-800">{file.name}</p>
                          </div>
                        </div>
                      </div>
                      {file.type === 'folder' && (
                      <div className="py-4 pr-4 flex-shrink-0 border-l pl-4 hover:bg-gray-100 leading-none h-[52px]" onClick={() => props.onNavigateToFolder(file.path!)}>
                        <i className="h-5 w-5 text-gray-400" aria-hidden="true">{Icons.render('chevronForward')}</i>
                      </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        </Transition>
      </div>
      {!isScrollAtBottom && !!props.files?.length && (
        <div className="bottom-0 h-10 pointer-events-none absolute inset-x-0 z-10 bg-gradient-to-b from-transparent to-white"></div>
      )}
    </div>
  )
}
