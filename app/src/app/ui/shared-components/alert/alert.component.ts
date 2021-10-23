import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent {

  @Input()
  public showalert: { state: boolean };

  @Input()
  public alertType: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'active' | 'disabled' = 'info';

  public alertClasses = 'animated flipInX';

  public hideAlert(): void {

    this.alertClasses = 'animated flipOutX';

    setTimeout(() => {
      this.showalert.state = false;
      this.alertClasses = 'animated flipInX';
    }, 700);
  }

}
