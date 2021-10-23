import { Params, Routes } from '@angular/router';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';

export interface AnitaRoutes extends Routes {
  data?: RouteDataValues;
}

export interface RouteDataValues extends Object {
  mode?: EDITOR_MODE;
}

export enum URL_PARAMS {
  projectId = 'projectId',
  sectionId = 'sectionId',
  elementId = 'elementId',
  parentId = 'parentId'
}

/**
 * Defines the admitted url param names based on the `URL_PARAMS` enum
 *
 * @remarks
 * Since `key in URL_PARAMS` doesn't work it is necessary to compute the keys, however computing only the first tricks TS to map to `URL_PARAMS` so it works.
 */
interface AnitaUrlParams {
  [URL_PARAMS.projectId]?: string;
  [URL_PARAMS.sectionId]?: string;
  [URL_PARAMS.elementId]?: string;
  [URL_PARAMS.parentId]?: string;
}

export interface CurrentRoute extends Object {
  name: string;
  url: string;
  params: AnitaUrlParams;
  data: RouteDataValues;
  firstLoad: Boolean;
}

export const currentRouteConstant: CurrentRoute = {
  name: '',
  url: '',
  params: {},
  data: {},
  firstLoad: true
};

export const previousRoutes: Array<CurrentRoute> = [];
