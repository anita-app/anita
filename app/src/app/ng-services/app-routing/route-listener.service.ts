import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CurrentRoute, currentRouteConstant, previousRoutes } from '@anita/client/ng-services/app-routing/current-route.constant';
import cloneDeep from 'lodash.clonedeep';
import { filter } from 'rxjs/operators';

/**
 * Listens to changes in route and sets params in memory on `currentRouteConstant` for easier access
 */
@Injectable({
  providedIn: 'root'
})
export class RouteListenerService {

  /**
   * The current route
   */
  private currentRoute: ActivatedRoute;

  /**
   * New state info to set on `currentRouteConstant`
   */
  private newStateInfo: CurrentRoute;

  /**
   * Adds previous data to `previousRoutes`
   */
  private static saveCopyInHistory(): void {
    const oldData = cloneDeep(currentRouteConstant);
    previousRoutes.unshift(oldData);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /**
   * Starts listening by piping a new listener on router
   */
  public startListening(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) as any)
      .subscribe(event => {
        this.fetchCurrentRoute();
        this.assignRouteToConstant();
      });
  }

  /**
   * Gets the info of the current route
   */
  private fetchCurrentRoute(): void {
    this.currentRoute = this.route.root;
    while (this.currentRoute.children[0] !== undefined)
      this.currentRoute = this.currentRoute.children[0];
  }

  /**
   * Assigns the new route info to `currentRouteConstant`
   */
  private assignRouteToConstant(): void {
    this.setNewStateInfo();
    RouteListenerService.saveCopyInHistory();
    Object.assign(currentRouteConstant, this.newStateInfo);
  }

  /**
   * Sets new state info
   */
  private setNewStateInfo(): void {
    this.newStateInfo = {
      name: this.currentRoute.snapshot.data['state'],
      url: this.router.url,
      params: this.currentRoute.snapshot.params,
      data: this.currentRoute.snapshot.data,
      firstLoad: false
    };
  }

}
