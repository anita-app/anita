import { IColumnExtended, ProjectSectionListTable } from 'app/components/project/section/list/table/table.component'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Section } from 'app/models/section/section.class'
import React, { useEffect, useState } from 'react'

interface IProjectSectionListTableProps {
  section: Section
  sectionData: Array<ISectionElement>
}

const generateColumns = (visibleFormFields: Array<FormFieldsModel<TSupportedFormsTypes>>): Array<IColumnExtended> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colsToShoww: Array<IColumnExtended> = []
  visibleFormFields.forEach(formModel => {
    colsToShoww.push({
      Header: formModel.label,
      accessor: formModel.fieldName,
      Cell: customRenderPicker(formModel),
      componentCode: formModel.componentCode
    })
  })
  return colsToShoww
}

export const ProjectSectionListTableContainer: React.FC<IProjectSectionListTableProps> = (props) => {
  const setRefresh = useState<number>(0)[1]
  useEffect(() => {
    const refreshVisibleColumns = () => {
      setRefresh(Date.now())
    }
    const subscription = props.section.visibleColumnsInTableView.subscribe(refreshVisibleColumns)
    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.section])

  return (
    <ProjectSectionListTable section={props.section} sectionData={props.sectionData} columns={generateColumns(props.section.getVisibleColumnsInTableView())} />
  )
}
