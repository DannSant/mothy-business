import {  Component, signal } from '@angular/core';

@Component({
  selector: 'toast-component',
  imports: [],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  visible = signal(false);
  message = signal('');
  show(msg: string) {
    this.message.set(msg);
    this.visible.set(true);
    setTimeout(() => this.visible.set(false), 3000);
  }
 }
