import { Component, Input } from '@angular/core';
import { CLIENT_SECTIONS } from '@anita/client/data/client-sections.enum';
import { dbInstances } from '@anita/client/data/db-instances.const';
import {
  AnitaUniversalDataStorage,
  LocalProjectSettings,
  ProjectSettings,
  RESERVED_UDS_KEYS
  } from '@anita/client/data/model/project-info';
import { DbConnector } from '@anita/client/libs/db-connector/db-connector.class';
import { FILE_HANDLES_PLUGIN } from '@anita/client/libs/db-connector/plugins/file-handles/exporter.constant';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { CurrentProjectSetter } from '@anita/client/libs/projects-helpers/project-handlers/current-project-setter.class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-select-btn',
  templateUrl: './project-select-btn.component.html',
  styleUrls: ['./project-select-btn.component.scss']
})
export class ProjectSelectBtnComponent {

  public currentProject$: Observable<AnitaUniversalDataStorage>;
  public settingsKey = RESERVED_UDS_KEYS._settings;

  constructor(
    store: Store<ReducerTypes>
  ) {
    this.currentProject$ = store.pipe(select('project'));
  }

  @Input()
  public pickedProject: ProjectSettings;

  public async loadProject(): Promise<void> {
    const projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: this.pickedProject.id }).single();
    dbInstances[this.pickedProject.id] = await new DbConnector([], FILE_HANDLES_PLUGIN, { projectInfo }).init();
    new CurrentProjectSetter(dbInstances[this.pickedProject.id].dbStore.db[RESERVED_UDS_KEYS._settings], dbInstances[this.pickedProject.id].dbStore.db[RESERVED_UDS_KEYS._sections]).set();
  }

}
