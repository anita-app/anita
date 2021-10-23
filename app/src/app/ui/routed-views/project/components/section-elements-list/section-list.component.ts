import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { RESERVED_UDS_KEYS, SectionElement, UserData } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { currentRouteConstant, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html'
})
export class SectionListComponent implements OnDestroy {

  public projectSystemData$: Observable<any>;
  public userSectionData$: Promise<Array<SectionElement>>;

  public projectId: string;
  public sectionId: string;
  public url: string;
  public sectionsKey = RESERVED_UDS_KEYS._sections;

  private routeSubscription: Subscription;

  constructor(
    router: Router,
    store: Store<ReducerTypes>
  ) {
    this.projectSystemData$ = store.pipe(select('project'));
    // We subscribe in the constructor otherwise data won't show up
    this.routeSubscription = router.events.subscribe(() => this.setIds());
  }

  public ngOnDestroy(): void {
    // We unsubscribe otherwise it would keep fetching data after closing the list view
    this.routeSubscription.unsubscribe();
  }

  private setIds(): void {
    if (this.projectId === currentRouteConstant.params[URL_PARAMS.projectId] && this.sectionId === currentRouteConstant.params[URL_PARAMS.sectionId])
      return;
    this.projectId = currentRouteConstant.params[URL_PARAMS.projectId];
    this.sectionId = currentRouteConstant.params[URL_PARAMS.sectionId];

    if (!this.projectId || !this.sectionId)
      return;

    this.setUrl();
    this.getUserSectionData();
  }

  private setUrl(): void {
    this.url = `/private/project/${this.projectId}/${this.sectionId}/add`;
  }

  private getUserSectionData(): void {
    this.userSectionData$ = dbInstances[this.projectId].callSelector<SectionElement>(this.sectionId).multiple();
  }
}
