import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
  } from '@angular/router';
import { CLIENT_SECTIONS } from '@anita/client/data/client-sections.enum';
import { dbInstances } from '@anita/client/data/db-instances.const';

/**
 * Allows navigation to projects' list only if there are projects, else redirects to the no projects view
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectsGuardService implements CanActivate {

  constructor(
    private router: Router
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    const projectsNumber: number = await dbInstances.system.callSelector(CLIENT_SECTIONS.projects).count();

    return this.accessControlRes(projectsNumber, state);
  }

  private accessControlRes(projectsNumber: number, state: RouterStateSnapshot): boolean {
    if (projectsNumber)
      return true;

    this.router.navigate(['/private/projects/none']);

    return false;
  }
}
