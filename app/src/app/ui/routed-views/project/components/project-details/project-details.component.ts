import { Component, Input } from '@angular/core';
import { ProjectSettings } from '@anita/client/data/model/project-info';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html'
})
export class ProjectDetailsComponent {

  @Input()
  public project: ProjectSettings;

}
