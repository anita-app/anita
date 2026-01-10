import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import type { FC, ReactNode } from 'react'

interface IFormEleContainerProps {
  children: ReactNode
  width: string | number
  advancedModeOnly?: boolean
}

export const FormEleContainer: FC<IFormEleContainerProps> = (props) => {
  const projectEditorMode = useAtomValue(FormProjectAtoms.mode)
  const hiddenClass = projectEditorMode === PROJECT_EDITOR_MODE.basic && props.advancedModeOnly ? 'hidden' : ''
  return (
    <div className={`${props.width} my-3 px-2 inline-block align-top ${hiddenClass}`}>
      {props.children}
    </div>
  )
}
