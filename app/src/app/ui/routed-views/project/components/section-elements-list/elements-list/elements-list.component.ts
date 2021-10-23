import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import {
  Section,
  SectionCustomFieldProperties,
  SectionElement,
  SectionSystemFieldsProperties
  } from '@anita/client/data/model/project-info';
import {
  NbGetters,
  NbSortDirection,
  NbSortRequest,
  NbTreeGridDataSource,
  NbTreeGridDataSourceBuilder
  } from '@nebular/theme';

@Component({
  selector: 'app-elements-list',
  templateUrl: './elements-list.component.html',
  styleUrls: ['./elements-list.component.scss']
})
export class ElementsListComponent implements OnChanges {

  @Input()
  public elements: Array<SectionElement>;

  @Input()
  public sectionId: string;

  @Input()
  public projectId: string;

  @Input()
  public section: Section;

  public allColumns: Array<string> = [];
  public formModels: Array<SectionSystemFieldsProperties | SectionCustomFieldProperties> = [];
  public columnNames: { [fieldName: string]: string } = {};
  public reservedCols = RESERVED_FIELDS;
  public source: NbTreeGridDataSource<SectionElement>;
  public sortColumn = '';
  public sortDirection: NbSortDirection = NbSortDirection.NONE;
  public basicCheckboxCode = FORM_COMPONENTS_CODES.basicCheckbox;
  // If any column has checkboxes we assign the css has-min class to reduce the col size
  public tableClass = '';

  constructor(
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<SectionElement>,
    private router: Router
  ) { }

  /**
   * Sets the data of the table and the columns each time the data passed via `@Input()` changes.
   *
   * @remarks
   * Columns must be reset after defining the data source otherwise failure to find the columns results in an error.
   */
  public ngOnChanges(): void {
    if (!this.elements)
      return;

    this.setSource();
    this.setColumns();
  }

  /**
   * Determines the columns of the table based on the `Section['formModel]` data.
   * Additionally, it filters the keys to exclude the reserved fields.
   *
   * @see RESERVED_FIELDS
   */
  private setColumns(): void {
    const arrReservedCols = Object.keys(RESERVED_FIELDS);
    this.allColumns.length = 0;
    this.section.formModel.forEach(fieldGroup => fieldGroup.forEach(fieldModel => {
      if (arrReservedCols.includes(fieldModel.fieldName) || this.allColumns.includes(fieldModel.fieldName) || !this.isCustomField(fieldModel))
        return;
      this.allColumns.push(fieldModel.fieldName);
      this.formModels.push(fieldModel);
      this.columnNames[fieldModel.fieldName] = fieldModel.label;
      if (fieldModel.componentCode === this.basicCheckboxCode)
        this.tableClass = 'has-min';
    }));
  }

  private isCustomField(arg: SectionCustomFieldProperties | SectionSystemFieldsProperties): arg is SectionCustomFieldProperties {
    return (arg as SectionCustomFieldProperties).label !== undefined;
  }

  private setSource(): void {
    const getters: NbGetters<SectionElement, SectionElement> = {
      dataGetter: (node: SectionElement) => node
    };
    this.source = this.dataSourceBuilder.create(this.elements, getters);
  }

  public updateSort(sortRequest: NbSortRequest): void {
    this.source.sort(sortRequest);
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  public getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  public openDetails(element: SectionElement): void {
    this.router.navigate(
      ['/private/project/', this.projectId, this.sectionId, 'details', element.id],
      { state: { element } }
    );
  }

  public trackCols(index: number, colName: string): string {
    return colName;
  }

}
