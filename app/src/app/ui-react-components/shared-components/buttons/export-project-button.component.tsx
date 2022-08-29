import { Manager } from 'app/libs/Manager/Manager.class'
import ReactTooltip from 'react-tooltip'
import React from 'react'
import { Dropdown, IMenuItem } from 'app/ui-react-components/shared-components/common-ui-eles/dropdown.component'
import { ExportScope } from 'app/Models/Project/ProjectExporter.class'

const exportMenuItems: Array<IMenuItem> = [
  {
    id: 'dataAndStructure',
    label: 'Data and Structure',
    handleClick: () => Manager.getCurrentProject().export(ExportScope.all)
  },
  {
    id: 'dataOnly',
    label: 'Data Only',
    handleClick: () => Manager.getCurrentProject().export(ExportScope.dataOnly)
  },
  {
    id: 'structureOnly',
    label: 'Structure Only',
    handleClick: () => Manager.getCurrentProject().export(ExportScope.structureOnly)
  }
]

export const ExportButton: React.FC = () => (
  <Dropdown
    id="exportProject"
    label="Export"
    labelClassName="hidden lg:inline-block"
    tooltip="Export"
    tooltipClassName='lg:hidden'
    chevronClassName="hidden lg:inline-block"
    icon="bi-arrow-bar-up"
    iconClassName="lg:hidden"
    margin="mr-3"
    menuItems={exportMenuItems}
  />
)
