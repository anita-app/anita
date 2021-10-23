import { Routes } from '@angular/router';
import { ADMIN_ROUTES } from '@anita/client/ui/shared-components/admin/admin-routes.constant';

export const routes: Routes = [

  { path: 'private', redirectTo: 'private/projects/list', pathMatch: 'full' },
  { path: 'private', children: ADMIN_ROUTES },

  { path: '', redirectTo: 'private/projects/list', pathMatch: 'full' },

  { path: '**', redirectTo: 'private/projects/list', pathMatch: 'full' }

];
