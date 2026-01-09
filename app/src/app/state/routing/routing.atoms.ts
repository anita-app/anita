import { IRouteParams, TAnitaRoute } from 'app/libs/routing/anita-routes.constant'
import { atom, PrimitiveAtom } from 'jotai'

export class RoutingAtoms {
  public static route: PrimitiveAtom<TAnitaRoute | null> = atom(null) as PrimitiveAtom<TAnitaRoute | null>
  public static params: PrimitiveAtom<IRouteParams | null> = atom(null) as PrimitiveAtom<IRouteParams | null>
}
