import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AnitaUniversalDataStorage } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

/**
 * Allows navigation to project routes only if a project is already loaded in current state
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectGuardService implements CanActivate {

  constructor(
    private router: Router,
    private store: Store<ReducerTypes>
  ) { }

  public async canActivate(): Promise<boolean> {

    const project = await this.store.pipe(select('project'), take(1)).toPromise<AnitaUniversalDataStorage>();

    if (project)
      return true;

    this.router.navigate(['/private/projects/list']);

    return false;
  }

}
