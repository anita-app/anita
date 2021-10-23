import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { ProjectFileImporter } from '@anita/client/libs/projects-helpers/file-handle-helpers/project-file-importer.class';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-no-projects',
  templateUrl: './no-projects.component.html'
})
export class NoProjectsComponent implements OnInit, OnDestroy {

  public projects$: Observable<Array<LocalProjectSettings>>;

  private checkProjects = true;

  constructor(
    private router: Router,
    private store: Store<ReducerTypes>
  ) { }

  public ngOnInit(): void {
    this.store.select('projects')
      .pipe(takeWhile(() => this.checkProjects))
      .subscribe(projects => this.checkIfProjects(projects));
  }

  public ngOnDestroy(): void {
    this.checkProjects = false;
  }

  public importPrject(): void {
    new ProjectFileImporter().import();
  }

  private checkIfProjects(projects: Array<LocalProjectSettings>): void {
    if (projects.length > 0) {
      this.checkProjects = false;
      this.router.navigate(['/private/projects', 'list']);
    }
  }
}
