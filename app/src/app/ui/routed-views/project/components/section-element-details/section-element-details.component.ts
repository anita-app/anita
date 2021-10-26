import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { RESERVED_UDS_KEYS, SectionElement, SystemData } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { currentRouteConstant, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-section-element-details',
  templateUrl: './section-element-details.component.html',
  styleUrls: ['./section-element-details.component.scss']
})
export class SectionElementDetailsComponent implements OnDestroy {

  public sections$: Observable<SystemData[RESERVED_UDS_KEYS._sections]>;

  public element: SectionElement;
  public sectionId: string;
  public elementId: string;
  public editUrl: string;
  public reserved = RESERVED_FIELDS;
  public basicCheckboxCode = FORM_COMPONENTS_CODES.basicCheckbox;
  public projectId: string;
  private routeSubscription: Subscription;

  constructor(
    router: Router,

    store: Store<ReducerTypes>
  ) {
    this.sections$ = store.pipe(select('project', RESERVED_UDS_KEYS._sections));
    // We subscribe in the constructor otherwise data won't show up
    this.routeSubscription = router.events.subscribe(() => this.setIds());
  }

  public ngOnDestroy(): void {
    // We unsubscribe otherwise it would keep fetching data after closing the list view
    this.routeSubscription.unsubscribe();
  }

  private setIds(): void {
    this.projectId = currentRouteConstant.params[URL_PARAMS.projectId];
    this.sectionId = currentRouteConstant.params[URL_PARAMS.sectionId];
    this.elementId = currentRouteConstant.params[URL_PARAMS.elementId];

    if (!this.projectId || !this.sectionId || !this.elementId)
      return;

    this.setViewData();
  }

  private async setViewData(): Promise<void> {
    await this.setElement();
    this.setEditUrl();
  }

  /**
   * Sets the element to display based on the object passed to `history.state` by `Router`
   */
  private async setElement(): Promise<void> {
    if (history.state.element)
      this.element = history.state.element;
  }

  private setEditUrl(): void {
    this.editUrl = `/private/project/${this.projectId}/${this.sectionId}/edit/${this.elementId}`;
  }

}
