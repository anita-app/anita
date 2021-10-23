import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { LayoutService } from '@anita/client/ui/shared-components/admin/@core/layout.service';
import { NbSidebarService } from '@nebular/theme';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  public projects$: Observable<Array<LocalProjectSettings>>;

  constructor(
    private sidebarService: NbSidebarService,
    private router: Router,
    private layoutService: LayoutService,
    store: Store<ReducerTypes>
  ) {
    this.projects$ = store.pipe(select('projects'));
  }

  public toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  public toggleSettings(): boolean {
    this.sidebarService.toggle(false, 'settings-sidebar');

    return false;
  }

  public goTo(destination: string): void {
    this.router.navigate([destination]);
  }

  public startSearch(): void {

  }

}
