import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AlertComponent } from '@anita/client/ui/shared-components/alert/alert.component';
import { NbAlertModule } from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    NbAlertModule
  ],
  declarations: [AlertComponent],
  exports: [AlertComponent]
})
export class AlertModule { }
