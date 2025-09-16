import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
