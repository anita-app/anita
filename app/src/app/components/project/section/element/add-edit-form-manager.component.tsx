import { Manager } from 'app/cross-refs-exports'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { useAtomValue } from 'jotai'
import { FormElementAtoms } from 'app/state/form-element/form-element.atoms'
import { FormElementState } from 'app/state/form-element/form-element-state.class'
import type { FC } from 'react'
import type { FormAutomatorOnChangeValue } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

interface IProjectFormElementManagerProps {
  sectionId: string
}

export const ProjectSectionElementAddEditFormManager: FC<IProjectFormElementManagerProps> = (props) => {
  const project = Manager.getCurrentProject()
  const allSections = project?.getSectionsDefinitions()!
  const section = project?.getSectionById(props.sectionId)

  const element = useAtomValue(FormElementAtoms.element)

  const handleChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    FormElementState.updateElementKey(fieldName as keyof ISectionElement, value as ISectionElement[keyof ISectionElement])
  }

  if (!section || !element) {
    return null
  }

  return (
    <form name="element-form">
      {section.childOf && section.childOf.length > 0 && (<FormAutomator
        formModel={[section.getParentInfoFormEle(allSections)]}
        element={element}
        handleChange={handleChange}
                                                         />)}
      <FormAutomator
        formModel={section?.formModel!}
        element={element!}
        handleChange={handleChange}
      />
    </form>
  )
}
