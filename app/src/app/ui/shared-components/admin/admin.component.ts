import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnitaUniversalDataStorage, LocalProjectSettings } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { MainMenuMaker } from '@anita/client/ui/shared-components/admin/menu/main-menu-maker.class';
import { Store } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  template: `
    <app-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </app-sample-layout>
  `
})
export class AdminComponent implements OnInit, OnDestroy {

  public menu = [];

  private alive = true;

  constructor(
    private store: Store<ReducerTypes>
  ) { }

  public ngOnInit(): void {
    this.setMenu();
    this.store.select('project')
      .pipe(takeWhile(() => this.alive))
      .subscribe(project => this.makeMenu({ project }));
    this.store.select('projects')
      .pipe(takeWhile(() => this.alive))
      .subscribe(projects => this.makeMenu({ projects }));
  }

  private async setMenu(): Promise<void> {
    const newMenus = await new MainMenuMaker().make();
    this.menu.push(...newMenus);
  }

  public ngOnDestroy(): void {
    this.alive = false;
  }

  private async makeMenu({ projects, project }: { projects?: Array<LocalProjectSettings>; project?: AnitaUniversalDataStorage; } = {}): Promise<void> {
    const newMenus = await new MainMenuMaker(projects, project).make();
    this.menu.length = 0;
    this.menu.push(...newMenus);
  }

}
