import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogComponent } from './core/components/dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DialogComponent],
  template: '<router-outlet /><app-dialog />'
})
export class AppComponent {}
