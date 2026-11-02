import { Bucket } from 'app/state/bucket.state'
import { LayoutAtoms } from 'app/state/layout/layout.atoms'

/**
 * @featurePart navigation.sidebar
 */
export class LayoutState {
  public static toggleSidebar () {
    const current = Bucket.general.get(LayoutAtoms.sidebarCollapsed)
    Bucket.general.set(LayoutAtoms.sidebarCollapsed, !current)
  }
}
