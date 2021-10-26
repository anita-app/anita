import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { RESERVED_UDS_KEYS, SectionElement, SystemData } from '@anita/client/data/model/project-info';
import { GetParentInfoForDetailsView, ParentInfoForDetailsView } from '@anita/client/ui/routed-views/project/helpers/get-parent-info-for-details-view.class';

@Component({
  selector: 'app-parent-info-viewer-and-link',
  templateUrl: './parent-info-viewer-and-link.component.html'
})
export class ParentInfoViewerAndLinkComponent implements OnChanges {

  @Input()
  public projectId: string;

  @Input()
  public element: SectionElement;

  @Input()
  public sections: SystemData[RESERVED_UDS_KEYS._sections];

  public parentField = RESERVED_FIELDS.parentsInfo;
  public parentsInfo: Array<ParentInfoForDetailsView> = [];

  constructor(
    private router: Router
  ) { }

  public ngOnChanges(): void {
    this.parentsInfo.length = 0;
    if (Array.isArray(this.element[this.parentField]) && this.element[this.parentField].length)
      this.callGetParentInfo();
  }

  public openDetails(sectionId: string, element: SectionElement): void {
    this.router.navigate(
      ['/private/project/', this.projectId, sectionId, 'details', element[RESERVED_FIELDS.id]],
      { state: { element } }
    );
  }

  private async callGetParentInfo(): Promise<void> {
    this.parentsInfo = await new GetParentInfoForDetailsView(this.element[this.parentField] as Array<string>, this.projectId, this.sections).get();
  }

}
