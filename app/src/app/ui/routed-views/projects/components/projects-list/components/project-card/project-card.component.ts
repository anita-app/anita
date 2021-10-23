import { Component, Input } from '@angular/core';
import { ProjectSettings } from '@anita/client/data/model/project-info';
import { ProjectDeleteConfirmComponent } from '@anita/client/ui/routed-views/projects/components/projects-list/components/project-delete-confirm/project-delete-confirm.component';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent {

  @Input()
  public project: ProjectSettings;

  constructor(
    private dialogService: NbDialogService
  ) { }

  public deleteProject(): void {
    this.dialogService.open(ProjectDeleteConfirmComponent, { context: { project: this.project } });
  }

}
