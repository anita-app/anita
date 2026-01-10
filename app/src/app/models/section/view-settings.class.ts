import { SupportedViews } from 'app/models/section/view-settings.const'
import type { ISectionViewSettings } from 'app/models/section/section.declarations'

export class ViewSettings {
  constructor (
    private viewSettings: ISectionViewSettings = {} as ISectionViewSettings,
  ) { }

  public getPreferredView (): SupportedViews {
    return this.viewSettings.preferredView || SupportedViews.table
  }

  public setPreferredView (view: SupportedViews) {
    this.viewSettings.preferredView = view
  }
}
