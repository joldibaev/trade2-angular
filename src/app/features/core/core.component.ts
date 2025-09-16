import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsideComponent } from '../../shared/components/aside/aside.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-core',
  imports: [AsideComponent, NavbarComponent, RouterOutlet],
  templateUrl: './core.component.html',
  styleUrl: './core.component.css',
  host: {
    class: 'flex flex-col h-screen',
  },
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreComponent {
  asideOpened = signal(false);
}
