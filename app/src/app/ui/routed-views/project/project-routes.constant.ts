import { AnitaRoutes, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';
import { ProjectInfoComponent } from '@anita/client/ui/routed-views/project/components/project-info/project-info.component';
import { SectionElementDetailsComponent } from '@anita/client/ui/routed-views/project/components/section-element-details/section-element-details.component';
import { SectionElementEditorComponent } from '@anita/client/ui/routed-views/project/components/section-element-editor/section-element-editor.component';
import { SectionListComponent } from '@anita/client/ui/routed-views/project/components/section-elements-list/section-list.component';

export const PROJECT_ROUTES: AnitaRoutes = [
  { path: '', redirectTo: 'projects/list', pathMatch: 'full' },

  { path: `:${URL_PARAMS.projectId}`, redirectTo: ':projectId/info', pathMatch: 'full' },
  { path: `:${URL_PARAMS.projectId}/info`, component: ProjectInfoComponent },

  { path: `:${URL_PARAMS.projectId}/list/:${URL_PARAMS.sectionId}`, component: SectionListComponent },

  { path: `:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/add`, component: SectionElementEditorComponent, data: { mode: EDITOR_MODE.add } },

  { path: `:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/edit`, redirectTo: ':projectId/info', data: { mode: EDITOR_MODE.edit } },
  { path: `:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/edit/:${URL_PARAMS.elementId}`, component: SectionElementEditorComponent, data: { mode: EDITOR_MODE.edit } },

  { path: `:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/details/:${URL_PARAMS.elementId}`, component: SectionElementDetailsComponent }
];
