import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Toggle } from 'app/components/shared-components/common-ui-eles/toggle.component'
import { ListTabsHeaderRightAddField } from 'app/components/project/section/list/tabs/header-right-add-field.component'
import { ModalState } from 'app/state/modal/modal-state.class'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Bucket } from 'app/state/bucket.state'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { Section } from 'app/models/section/section.class'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import { useLiveQuery } from 'dexie-react-hooks'
import type { FC } from 'react'
import type { IModalProps } from 'app/state/modal/modal-state.class'

interface IListTabsHeaderRightEditViewListProps {
  sectionId: string
}

/**
 * @feature view.table-columns
 * @title Show or hide columns of a table
 * @summary Chooses which fields of a section appear as columns in its table.
 * @where List of a section, table view: the gear icon "Edit view" at the top right, then the "Edit visible columns" window.
 * @usage Click the gear icon, switch on or off the field you want to show or hide, then click "Close".
 * @options One switch per field of the section; all fields are shown by default. The "Add field" button in the same window adds a new field to the section.
 * @rules Changes apply at once and are saved in the project (they are synced with it). Hiding a column does not delete any data. The field that names the records stays the first column when it is shown.
 * @errors none
 * @status stable
 * @since 0.16.0
 * @routes projectSectionElesList
 * @covers view:table
 * @related view.table, view.add-field
 */
export const ListTabsHeaderRightEditViewTable: FC<IListTabsHeaderRightEditViewListProps> = (props) => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, props.sectionId), [projectId, props.sectionId])

  if (!sectionData) {
    return null
  }

  const section = new Section(projectId, sectionData)

  const handleChangeForSection = (formEleFieldName: string, value: boolean) => {
    section.setIsFormEleVisibleInTable(formEleFieldName, value)
  }

  const handleOnAddFieldClick = () => {
    const project = Bucket.general.get(ProjectAtoms.currentProject)
    const payload = project?.getSystemData()
    const sectionIndex = payload?._sections?.findIndex((sez) => sez.id === section.id)
    if (payload && sectionIndex !== undefined) {
      FormProjectState.setFormProject(payload)
      FormProjectState.addFieldToSection(sectionIndex)
    }
    ModalState.showModal({
      title: 'Add field',
      actionText: 'Add',
      type: Type.primary,
      hideActionRow: true,
      children: <><ListTabsHeaderRightAddField sectionId={section.id} /></>,
    } as IModalProps)
  }

  return (
    <div className="mt-6">
      {section.formModel.map((formEle) => (
        <div key={formEle.fieldName}>
          <Toggle
            label={formEle.label!}
            initialState={section.getIsFormEleVisibleInTable(formEle.fieldName)}
            onChange={(value) => handleChangeForSection(formEle.fieldName, value)}
          />
        </div>
      ))}
      <Button
        id="addField"
        label="Add field"
        onClick={handleOnAddFieldClick}
        type={Type.transparent}
        size="sm"
        iconLeft="add"
        className="mt-1"
      />
    </div>
  )
}
