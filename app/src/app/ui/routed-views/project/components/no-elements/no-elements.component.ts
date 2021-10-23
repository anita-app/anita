import { Component } from '@angular/core';
import { AnitaUniversalDataStorage, RESERVED_UDS_KEYS, SystemData } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { currentRouteConstant, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-no-elements',
  templateUrl: './no-elements.component.html'
})
export class NoElementsComponent {

  public sections$: Observable<SystemData[RESERVED_UDS_KEYS._sections]>;

  public currentProjectId = currentRouteConstant.params[URL_PARAMS.projectId];
  public currentSectionId = currentRouteConstant.params[URL_PARAMS.sectionId];

  constructor(
    store: Store<ReducerTypes>
  ) {
    this.sections$ = store.pipe(select('project', RESERVED_UDS_KEYS._sections));
  }

}
