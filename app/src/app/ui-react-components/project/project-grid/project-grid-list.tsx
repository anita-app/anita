import { SectionElement } from 'app/data/project-structure/project-info'
import { ProjectGridListElement } from 'app/ui-react-components/project/project-grid/project-grid-list-element'
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum';
import { Manager } from 'app/libs/Manager/Manager.class';

interface IProjectGridListProps {
  sectionId: string
  sectionData: Array<SectionElement>
}

export const ProjectGridList: React.FC<IProjectGridListProps> = (props) => {
  const titleKey = Manager.getCurrentProject().getSectionById(props.sectionId).getFirstUserDefinedField()?.fieldName
  const descriptionField = Manager.getCurrentProject().getSectionById(props.sectionId).getFirstFieldOfType([FORM_COMPONENTS_CODES.basicTextarea])
  return (
    <div role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {props.sectionData.map(element => (
        <ProjectGridListElement key={element.id} element={element} titleKey={titleKey} descriptionKey={descriptionField?.fieldName} />
      ))}
    </div>
  )
}