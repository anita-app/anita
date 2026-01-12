import { Dropdown } from 'app/components/shared-components/common-ui-eles/dropdown.component'
import { ExportScope } from 'app/models/project/project-exporter.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { FC } from 'react'
import type { IMenuItem } from 'app/components/shared-components/common-ui-eles/dropdown.component'

const exportMenuItems: Array<IMenuItem> = [
  {
    id: 'dataAndStructure',
    label: 'Data and Structure',
    handleClick: () => Bucket.general.get(ProjectAtoms.currentProject)!.export(ExportScope.all),
  },
  {
    id: 'dataOnly',
    label: 'Data Only',
    handleClick: () => Bucket.general.get(ProjectAtoms.currentProject)!.export(ExportScope.dataOnly),
  },
  {
    id: 'structureOnly',
    label: 'Structure Only',
    handleClick: () => Bucket.general.get(ProjectAtoms.currentProject)!.export(ExportScope.structureOnly),
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
