import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from '@anita/client/ui/app-component/app.component';
import { routes } from '@anita/client/ui/app-component/routes.contant';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  declarations: [
    AppComponent
  ]
})
export class AppComponentModule { }
