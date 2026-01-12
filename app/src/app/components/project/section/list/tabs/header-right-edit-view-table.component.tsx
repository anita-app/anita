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

export const ListTabsHeaderRightEditViewTable: FC<IListTabsHeaderRightEditViewListProps> = (props) => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, props.sectionId))

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
