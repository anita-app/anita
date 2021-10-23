import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-dialog-confirmer',
  templateUrl: './dialog-confirmer.component.html'
})
export class DialogConfirmerComponent {

  constructor(
    protected ref: NbDialogRef<DialogConfirmerComponent>
  ) { }

  public dismiss(): void {
    this.ref.close(false);
  }

  public doDelete(): void {
    this.ref.close(true);
  }
}
