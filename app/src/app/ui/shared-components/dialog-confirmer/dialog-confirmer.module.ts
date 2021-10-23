import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDialogModule } from '@nebular/theme';
import { DialogConfirmerComponent } from './dialog-confirmer.component';

@NgModule({
  declarations: [DialogConfirmerComponent],
  imports: [
    CommonModule,
    NbCardModule,
    NbDialogModule,
    NbButtonModule
  ],
  entryComponents: [DialogConfirmerComponent]
})
export class DialogConfirmerModule { }
