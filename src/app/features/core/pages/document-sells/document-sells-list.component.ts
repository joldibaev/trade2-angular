import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-document-sells',
  imports: [TableModule, ToastModule],
  templateUrl: './document-sells-list.component.html',
  styleUrl: './document-sells-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentSellsListComponent {}
