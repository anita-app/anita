import { ISection, SectionElement } from 'app/data/project-structure/project-info'
import { ProjectGridListElement } from 'app/ui-react-components/project/project-grid/project-grid-list-element'
import { findFirstFieldOfType, findFirstUserDefinedField } from 'app/libs/tools/find-first-user-defined-field.function';
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum';

interface IProjectGridListProps {
  sectionInfo: ISection
  sectionData: Array<SectionElement>
}

export const ProjectGridList: React.FC<IProjectGridListProps> = (props) => {
  const titleKey = props.sectionInfo.formModel[findFirstUserDefinedField(props.sectionInfo.formModel)].fieldName
  const descriptionField = findFirstFieldOfType(props.sectionInfo.formModel, [FORM_COMPONENTS_CODES.basicTextarea])
  return (
    <div role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {props.sectionData.map(element => (
        <ProjectGridListElement key={element.id} element={element} titleKey={titleKey} descriptionKey={descriptionField?.fieldName} />
      ))}
    </div>
  )
}