import { Component, model, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ButtonDirective, ButtonIcon } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, ButtonIcon, ButtonDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  host: {
    class: 'flex items-center bg-white dark:bg-surface-900 shadow relative z-20 p-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  asideOpened = model();

  toggleCollapse() {
    this.asideOpened.update(value => !value);
  }
}
