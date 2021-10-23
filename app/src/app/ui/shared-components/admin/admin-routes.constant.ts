import { AnitaRoutes } from '@anita/client/ng-services/app-routing/current-route.constant';
import { ProjectGuardService } from '@anita/client/ng-services/guard-services/project-guard.service';
import { PROJECT_ROUTES } from '@anita/client/ui/routed-views/project/project-routes.constant';
import { PROJECTS_ROUTES } from '@anita/client/ui/routed-views/projects/projects-routes.constant';
import { AdminComponent } from '@anita/client/ui/shared-components/admin/admin.component';

export const ADMIN_ROUTES: AnitaRoutes = [
  {
    path: '', component: AdminComponent, children: [

      { path: 'projects', redirectTo: 'projects/list', pathMatch: 'full' },
      { path: 'projects', children: PROJECTS_ROUTES },

      { path: 'project', redirectTo: 'projects/list', pathMatch: 'full' },
      { path: 'project', canActivate: [ProjectGuardService], children: PROJECT_ROUTES }

    ]
  }];
