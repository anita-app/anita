import { Component, Input } from '@angular/core';
import { ProjectSettings } from '@anita/client/data/model/project-info';
import { ProjectDeletor } from '@anita/client/libs/projects-helpers/project-handlers/project-deletor.class';
import { NbDialogRef, NbDialogService } from '@nebular/theme';

@Component({
  selector: 'app-project-delete-confirm',
  templateUrl: './project-delete-confirm.component.html'
})
export class ProjectDeleteConfirmComponent {

  @Input()
  public project: ProjectSettings;

  constructor(
    private dialogService: NbDialogService,
    protected ref: NbDialogRef<ProjectDeleteConfirmComponent>
  ) { }

  public dismiss(): void {
    this.ref.close();
  }

  public async doDeleteProject(): Promise<void> {
    new ProjectDeletor(this.project).delete();
    this.dismiss();
  }

}
