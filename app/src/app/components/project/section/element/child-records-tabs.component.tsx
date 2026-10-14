import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { useLiveQuery } from 'dexie-react-hooks'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Icons } from 'app/libs/icons/icons.class'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { withTitleFieldFirst } from 'app/models/section/title-field.function'
import type { CSSProperties, FC, ReactNode } from 'react'
import type { ISection } from 'app/models/section/section.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'

const MAX_COLUMNS = 4

const HIDDEN_CODES = [FORM_COMPONENTS_CODES.hiddenInput, FORM_COMPONENTS_CODES.richText, FORM_COMPONENTS_CODES.basicTextarea, FORM_COMPONENTS_CODES.parentsSelector]

/**
 * URL of the form to add a record to a section, already linked to a parent record.
 */
export const addLinkedRecordUrl = (projectId: string, sectionId: string, parentSectionId: string, parentElementId: string): string => (
  `${urlParamFiller(ANITA_URLS.projectSectionAddEle, [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }])}?parent=${encodeURIComponent(`${parentSectionId}|${parentElementId}`)}`
)

const columnsOf = (section: ISection): Array<FormFieldsModel<ISectionElement>> => (
  withTitleFieldFirst(
    (section.formModel as Array<FormFieldsModel<ISectionElement>>).filter(formEle => formEle.label && !HIDDEN_CODES.includes(Number(formEle.componentCode))),
    section.formModel,
  ).slice(0, MAX_COLUMNS)
)

const renderValue = (formEle: FormFieldsModel<ISectionElement>, value: unknown): ReactNode => {
  if (Number(formEle.componentCode) === FORM_COMPONENTS_CODES.basicCheckbox) {
    return value ? <span className="text-green-600">{Icons.render('checkmarkOutline')}</span> : null
  }
  if (value === undefined || value === null || value === '') {
    return null
  }
  return customRenderPicker(formEle)({ value }) as ReactNode
}

interface IChildRecordsTableProps {
  projectId: string
  section: ISection
  records: Array<ISectionElement>
  addUrl: string
}

const ChildRecordsTable: FC<IChildRecordsTableProps> = (props) => {
  const columns = columnsOf(props.section)
  const title = props.section.title

  if (!props.records.length) {
    return (
      <div className="text-center py-8 text-[#5b6b80]">
        <p>No {title.toLowerCase()} linked to this record yet.</p>
        <Button
          id={`addFirst-${props.section.id}`}
          label={`Add to ${title}`}
          iconLeft="addOutline"
          type={Type.primary}
          href={props.addUrl}
          marginClassName="mt-3"
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="ui-table w-full text-sm">
        <thead>
          <tr className="text-left">
            {columns.map(column => (
              <th
                key={column.fieldName}
                className="px-3 py-2.5 whitespace-nowrap"
              >
                {column.label}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {props.records.map((record, rowIndex) => {
            const url = urlParamFiller(ANITA_URLS.projectSectionEleDetails, [
              { name: URL_PARAMS.projectId, value: props.projectId },
              { name: URL_PARAMS.sectionId, value: props.section.id },
              { name: URL_PARAMS.elementId, value: record.id! },
            ])
            return (
              <tr
                key={record.id}
                className="ui-row"
                style={{ '--d': Math.min(rowIndex, 12) } as CSSProperties}
              >
                {columns.map((column, index) => (
                  <td
                    key={column.fieldName}
                    className={`px-3 py-2.5 align-top ${index === 0 ? 'ui-title-cell' : 'text-[#334155]'}`}
                  >
                    {index === 0
                      ? (
                        <Link
                          to={url}
                          className="font-semibold text-inherit"
                        >
                          {renderValue(column, record[column.fieldName]) ?? 'Untitled'}
                        </Link>)
                      : renderValue(column, record[column.fieldName])}
                  </td>
                ))}
                <td className="ui-row-go px-3 py-2.5 text-right">
                  <Link
                    to={url}
                    aria-label="Open"
                    className="inline-flex"
                  >
                    {Icons.render('chevronForwardOutline')}
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface IChildRecordsTabsProps {
  projectId: string
  sectionId: string
  elementId: string
}

/**
 * Records of the child sections linked to a record, one tab per child section.
 * E.g. on a client: its projects; on a project: its tasks.
 */
export const ChildRecordsTabs: FC<IChildRecordsTabsProps> = (props) => {
  const project = useAtomValue(ProjectAtoms.currentProject)
  const childSections = useMemo(
    () => (project?.getSectionsDefinitions() ?? []).filter(section => section.childOf?.includes(props.sectionId)),
    [project, props.sectionId],
  )
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const parentKey = `${props.sectionId}|${props.elementId}`

  const recordsBySection = useLiveQuery(async () => {
    const result: Record<string, Array<ISectionElement>> = {}
    for (const section of childSections) {
      const records = (await Queriers.getElements(props.projectId, section.id)) ?? []
      result[section.id] = records.filter(record => Array.isArray(record.parentsInfo) && record.parentsInfo.includes(parentKey))
    }
    return result
  }, [childSections, props.projectId, parentKey])

  if (!childSections.length) {
    return null
  }

  const active = childSections.find(section => section.id === activeSectionId) ?? childSections[0]
  const addUrl = addLinkedRecordUrl(props.projectId, active.id, props.sectionId, props.elementId)

  return (
    <div className="ui-card ui-rise mt-4 p-4 md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#eef1f5]">
        <div
          className="ui-seg max-w-full overflow-x-auto gap-0.5"
          role="tablist"
          aria-label="Linked records"
        >
          {childSections.map(section => {
            const isActive = section.id === active.id
            const count = recordsBySection?.[section.id]?.length
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSectionId(section.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-[8px] text-sm font-semibold transition ${isActive ? 'bg-white text-prussian-blue-500 shadow-[0_1px_2px_rgba(0,35,70,0.14),0_3px_8px_-3px_rgba(0,35,70,0.2)]' : 'text-[#7a8799] hover:text-[#33445a]'}`}
              >
                {Icons.render(section.icon ?? 'chevronForwardOutline')}
                {section.title}
                {count !== undefined && (
                  <span className={isActive ? 'ui-count' : 'ui-count bg-transparent! text-[#8a97a8]!'}>{count}</span>
                )}
              </button>
            )
          })}
        </div>
        {!!recordsBySection?.[active.id]?.length && (
          <Button
            id={`addLinked-${active.id}`}
            label={`Add to ${active.title}`}
            iconLeft="addOutline"
            type={Type.secondary}
            size="sm"
            href={addUrl}
            marginClassName=""
          />
        )}
      </div>
      <div
        role="tabpanel"
        className="pt-2"
      >
        {recordsBySection
          ? (
            <ChildRecordsTable
              projectId={props.projectId}
              section={active}
              records={recordsBySection[active.id] ?? []}
              addUrl={addUrl}
            />)
          : <Loader />}
      </div>
    </div>
  )
}
