import { Component } from '@angular/core';
import { RESERVED_UDS_KEYS, SystemData } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blockchain-info',
  templateUrl: './project-info.component.html'
})
export class ProjectInfoComponent {

  public project$: Observable<SystemData[RESERVED_UDS_KEYS._settings]>;

  constructor(
    store: Store<ReducerTypes>
  ) {
    this.project$ = store.pipe(select('project', RESERVED_UDS_KEYS._settings));
  }

}
