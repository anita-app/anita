import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { getDateTime } from '@anita/client/libs/tools/tools';
import { StateService } from '@anita/client/ui/shared-components/admin/@core/state.service';
import { appVersion } from '@anita/client/version';
import {
  NbMediaBreakpoint,
  NbMediaBreakpointsService,
  NbMenuService,
  NbSidebarService,
  NbThemeService
  } from '@nebular/theme';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { delay, takeWhile, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar-layout',
  styleUrls: ['./sidebar-layout.component.scss'],
  templateUrl: './sidebar-layout.component.html'
})
export class SidebarLayoutComponent implements OnDestroy {

  public projects$: Observable<Array<LocalProjectSettings>>;

  public currentTheme: string;
  public today = getDateTime();
  public version = appVersion;
  private alive = true;

  constructor(
    protected stateService: StateService,
    protected menuService: NbMenuService,
    protected themeService: NbThemeService,
    protected bpService: NbMediaBreakpointsService,
    protected sidebarService: NbSidebarService,
    store: Store<ReducerTypes>
  ) {
    this.projects$ = store.pipe(select('projects'));
    const isBp = this.bpService.getByName('is');
    this.menuService.onItemSelect()
      .pipe(
        takeWhile(() => this.alive),
        withLatestFrom(this.themeService.onMediaQueryChange()),
        delay(20)
      )
      .subscribe(([item, [bpFrom, bpTo]]: [any, [NbMediaBreakpoint, NbMediaBreakpoint]]) => {

        if (bpTo.width <= isBp.width) {
          this.sidebarService.collapse('menu-sidebar');
        }
      });
  }

  public ngOnDestroy(): void {
    this.alive = false;
  }
}
