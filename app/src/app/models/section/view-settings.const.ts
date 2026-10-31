import type { TIconName } from 'app/libs/icons/icons.class'

/** @featurePart view.switch-view */
export enum SupportedViews {
  table,
  grid,
}

/** @internal */
export const SUPPORTED_VIEWS_ICONS: Array<TIconName> = ['table', 'gridOutline']
