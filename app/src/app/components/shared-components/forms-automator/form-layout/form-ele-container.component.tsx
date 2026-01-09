import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import React, { ReactNode } from 'react'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'

interface IFormEleContainerProps {
  children: ReactNode
  width: string | number
  advancedModeOnly?: boolean
}

export const FormEleContainer: React.FC<IFormEleContainerProps> = ({ children, width, advancedModeOnly }) => {
  const projectEditorMode = useAtomValue(FormProjectAtoms.mode)
  const hiddenClass = projectEditorMode === PROJECT_EDITOR_MODE.basic && advancedModeOnly ? 'hidden' : ''
  return (
    <div className={`${width} my-3 px-2 inline-block align-top ${hiddenClass}`}>
      {children}
    </div>
  )
}
