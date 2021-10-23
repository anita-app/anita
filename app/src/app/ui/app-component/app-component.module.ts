import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from '@anita/client/ui/app-component/app.component';
import { routes } from '@anita/client/ui/app-component/routes.contant';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [
    AppComponent
  ]
})
export class AppComponentModule { }
