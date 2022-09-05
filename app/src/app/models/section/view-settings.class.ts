import { ISectionViewSettings } from 'app/data/project-structure/project-info'
import { SupportedViews } from 'app/models/section/view-settings.const'

export class ViewSettings {
  constructor (
    private viewSettings: ISectionViewSettings = {} as ISectionViewSettings
  ) { }

  public getPreferredView (): SupportedViews {
    return this.viewSettings.preferredView || SupportedViews.table
  }

  public setPreferredView (view: SupportedViews) {
    this.viewSettings.preferredView = view
  }
}
