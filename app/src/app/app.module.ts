import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { REDUCERS } from '@anita/client/libs/ng-rx/reducers.const';
import { StartupperService } from '@anita/client/ng-services/startupper/startupper.service';
import { AppComponentModule } from '@anita/client/ui/app-component/app-component.module';
import { AppComponent } from '@anita/client/ui/app-component/app.component';
import { ThemeModule } from '@anita/client/ui/shared-components/admin/@theme/theme.module';
import { AdminModule } from '@anita/client/ui/shared-components/admin/admin.module';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbDatepickerModule,
  NbDialogModule,
  NbTimepickerModule,
  NbToastrModule,
  NbWindowModule
  } from '@nebular/theme';
import { StoreModule } from '@ngrx/store';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(REDUCERS),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ThemeModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbDialogModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbTimepickerModule.forRoot(),
    AppComponentModule,
    AdminModule,
    NbEvaIconsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    startupper: StartupperService
  ) {
    startupper.init();
  }
}
