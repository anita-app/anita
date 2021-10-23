import { Component } from '@angular/core';
import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { ProjectFileImporter } from '@anita/client/libs/projects-helpers/file-handle-helpers/project-file-importer.class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent {

  public projects$: Observable<Array<LocalProjectSettings>>;

  constructor(
    store: Store<ReducerTypes>
  ) {
    this.projects$ = store.pipe(select('projects'));
  }

  public trackProjects(index: number, project: LocalProjectSettings): string {
    return project.id;
  }

  public importProject(): void {
    new ProjectFileImporter().import();
  }

}
