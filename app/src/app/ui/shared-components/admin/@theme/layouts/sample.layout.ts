import { Component, OnDestroy } from '@angular/core';
import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { getDateTime } from '@anita/client/libs/tools/tools';
import { StateService } from '@anita/client/ui/shared-components/admin/@core/state.service';
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
  selector: 'app-sample-layout',
  styleUrls: ['./sample.layout.scss'],
  templateUrl: './sample.layout.html'
})
export class SampleLayoutComponent implements OnDestroy {

  public projects$: Observable<Array<LocalProjectSettings>>;

  public currentTheme: string;
  public today = getDateTime();
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
