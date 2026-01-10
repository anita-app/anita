import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'
import type { IRouteParams, TAnitaRoute, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import type { Atom, PrimitiveAtom } from 'jotai'
import type { AtomFamily } from 'jotai-family'

export class RoutingAtoms {
  public static route: PrimitiveAtom<TAnitaRoute | null> = atom(null) as PrimitiveAtom<TAnitaRoute | null>
  public static params: PrimitiveAtom<IRouteParams | null> = atom(null) as PrimitiveAtom<IRouteParams | null>
  public static param: AtomFamily<URL_PARAMS, Atom<string | undefined>> = atomFamily((param: URL_PARAMS) => atom(get => get(this.params)?.[param]))
}
