import { Injectable } from '@angular/core';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { stateData } from '@anita/client/ng-services/state-data/state-data.constant';
import { Store } from '@ngrx/store';

/**
 * Initializes ngRx and sets the pointer on `stateData` constant
 */
@Injectable({
  providedIn: 'root'
})
export class StateDataService {

  constructor(
    private store: Store<ReducerTypes>
  ) { }

  /**
   * Sets the pointer to the ngRx store already loaded in memory on `stateData` constant
   */
  public initRedux(): void {
    stateData.ngRxStore = this.store;
  }

}
