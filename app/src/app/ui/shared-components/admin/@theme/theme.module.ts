import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '@anita/client/ui/shared-components/admin/@theme/components/header/header.component';
import { SampleLayoutComponent } from '@anita/client/ui/shared-components/admin/@theme/layouts/sample.layout';
import { CapitalizePipe } from '@anita/client/ui/shared-components/admin/@theme/pipes/capitalize.pipe';
import { NumberWithCommasPipe } from '@anita/client/ui/shared-components/admin/@theme/pipes/number-with-commas.pipe';
import { PluralPipe } from '@anita/client/ui/shared-components/admin/@theme/pipes/plural.pipe';
import { RoundPipe } from '@anita/client/ui/shared-components/admin/@theme/pipes/round.pipe';
import { TimingPipe } from '@anita/client/ui/shared-components/admin/@theme/pipes/timing.pipe';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbContextMenuModule,
  NbDialogModule,
  NbIconModule,
  NbLayoutModule,
  NbListModule,
  NbMenuModule,
  NbPopoverModule,
  NbProgressBarModule,
  NbRouteTabsetModule,
  NbSearchModule,
  NbSidebarModule,
  NbTabsetModule,
  NbThemeModule,
  NbTooltipModule,
  NbUserModule
  } from '@nebular/theme';

const BASE_MODULES = [CommonModule, FormsModule, ReactiveFormsModule];

const NB_MODULES = [
  NbCardModule,
  NbLayoutModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbSidebarModule,
  NbCheckboxModule,
  NbPopoverModule,
  NbContextMenuModule,
  NbTooltipModule,
  NbProgressBarModule,
  NbListModule,
  NbButtonModule,
  NbIconModule,
  NbDialogModule
];

const COMPONENTS = [
  HeaderComponent,
  SampleLayoutComponent
];

const PIPES = [
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe
];

const NB_THEME_PROVIDERS = [
  ...NbThemeModule.forRoot(
    {
      name: 'default'
    }
  ).providers,
  ...NbSidebarModule.forRoot().providers,
  ...NbMenuModule.forRoot().providers
];

@NgModule({
  imports: [...BASE_MODULES, ...NB_MODULES],
  exports: [...BASE_MODULES, ...NB_MODULES, ...COMPONENTS, ...PIPES],
  declarations: [...COMPONENTS, ...PIPES]
})
export class ThemeModule {

  public static forRoot(): ModuleWithProviders<ThemeModule> {
    return {
      ngModule: ThemeModule,
      providers: [...NB_THEME_PROVIDERS]
    } as ModuleWithProviders<ThemeModule>;
  }
}
