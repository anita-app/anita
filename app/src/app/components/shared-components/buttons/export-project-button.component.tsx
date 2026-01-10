import { Manager } from 'app/cross-refs-exports'
import { Dropdown } from 'app/components/shared-components/common-ui-eles/dropdown.component'
import { ExportScope } from 'app/models/project/project-exporter.class'
import type { FC } from 'react'
import type { IMenuItem } from 'app/components/shared-components/common-ui-eles/dropdown.component'

const exportMenuItems: Array<IMenuItem> = [
  {
    id: 'dataAndStructure',
    label: 'Data and Structure',
    handleClick: () => Manager.getCurrentProject()!.export(ExportScope.all),
  },
  {
    id: 'dataOnly',
    label: 'Data Only',
    handleClick: () => Manager.getCurrentProject()!.export(ExportScope.dataOnly),
  },
  {
    id: 'structureOnly',
    label: 'Structure Only',
    handleClick: () => Manager.getCurrentProject()!.export(ExportScope.structureOnly),
  },
]

export const ExportButton: FC = () => (
  <Dropdown
    id="exportProject"
    label="Export"
    labelClassName="hidden lg:inline-block"
    tooltip="Export"
    tooltipClassName="lg:hidden"
    chevronClassName="hidden lg:inline-block"
    icon="cloudDownloadOutline"
    iconClassName="lg:hidden"
    margin="mr-3"
    menuItems={exportMenuItems}
  />
)
