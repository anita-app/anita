import { AnitaRoutes, RouteDataValues, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { ProjectGuardService } from '@anita/client/ng-services/guard-services/project-guard.service';
import { ProjectsGuardService } from '@anita/client/ng-services/guard-services/projects-guard.service';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';
import { NoProjectsComponent } from '@anita/client/ui/routed-views/projects/components/no-projects/no-projects.component';
import { ProjectEditorComponent } from '@anita/client/ui/routed-views/projects/components/project-editor/project-editor.component';
import { ProjectsListComponent } from '@anita/client/ui/routed-views/projects/components/projects-list/projects-list.component';

export const PROJECTS_ROUTES: AnitaRoutes = [
  { path: 'list', component: ProjectsListComponent, canActivate: [ProjectsGuardService] },
  { path: 'add', component: ProjectEditorComponent, data: { mode: EDITOR_MODE.add } },
  { path: `edit/:${URL_PARAMS.projectId}`, canActivate: [ProjectGuardService], component: ProjectEditorComponent, data: { mode: EDITOR_MODE.edit } },
  { path: 'none', component: NoProjectsComponent }
];
