import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Splitter } from 'primeng/splitter';
import { DocumentsComponent } from './documents/documents.component';
import { OperationsComponent } from './operations/operations.component';

@Component({
  selector: 'app-document-purchases',
  imports: [AsyncPipe, Splitter, DocumentsComponent, OperationsComponent],
  templateUrl: './document-purchases-list.component.html',
  styleUrl: './document-purchases-list.component.css',
  host: {
    class: 'flex flex-col h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentPurchasesListComponent {
  private readonly operationService = inject(OperationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  // Selected document purchase ID
  documentPurchaseId = toSignal(
    this.activatedRoute.queryParams.pipe(
      map(params => (params['documentPurchaseId'] ? params['documentPurchaseId'] : undefined))
    )
  );

  // Operations for selected document
  update = new BehaviorSubject(Date.now());
  operations$ = this.update.pipe(
    switchMap(() =>
      this.activatedRoute.queryParams.pipe(
        switchMap(params =>
          this.operationService.getByDocumentPurchase(params['documentPurchaseId'])
        )
      )
    )
  );

  onOperationsChanged() {
    this.update.next(Date.now());
  }
}
