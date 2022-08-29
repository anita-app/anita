import { Manager } from 'app/libs/Manager/Manager.class'
import ReactTooltip from 'react-tooltip'
import React from 'react'
import { Dropdown, IMenuItem } from 'app/ui-react-components/shared-components/common-ui-eles/dropdown.component'

const exportMenuItems: Array<IMenuItem> = [
  {
    id: 'dataAndStructure',
    label: 'Data and Structure',
    handleClick: () => Manager.getCurrentProject().export()
  },
  {
    id: 'dataOnly',
    label: 'Data Only',
    handleClick: () => Manager.getCurrentProject().export()
  },
  {
    id: 'structureOnly',
    label: 'Structure Only',
    handleClick: () => Manager.getCurrentProject().export()
  }
]

export const ExportButton: React.FC = () => (
  <Dropdown
    id="exportProject"
    label="Export"
    labelClassName="hidden md:inline-block"
    tooltip="Export"
    tooltipClassName='md:hidden'
    chevronClassName="hidden md:inline-block"
    icon="bi-arrow-bar-up"
    iconClassName="md:hidden"
    margin="mr-3"
    menuItems={exportMenuItems}
  />
)

export const ExportButtonO: React.FC = () => (
  <button
    className="px-4 py-3 text-gray-800 mr-3 inline-flex items-center ml-auto leading-none text-sm bg-gray-100 hover:bg-gray-200 rounded"
    data-tip={true} data-for="exportProject"
    onClick={Manager.getCurrentProject().export}
  >
    <i className="bi bi-arrow-bar-up"></i>
    <ReactTooltip id="exportProject" effect="solid">
      Export project
    </ReactTooltip>
  </button>
)
