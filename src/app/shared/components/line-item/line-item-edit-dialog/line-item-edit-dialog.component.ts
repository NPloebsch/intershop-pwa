import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { LineItemUpdate } from 'ish-core/models/line-item-update/line-item-update.model';
import { LineItemView } from 'ish-core/models/line-item/line-item.model';
import { VariationProductView } from 'ish-core/models/product-view/product-view.model';
import { ModalDialogComponent } from 'ish-shared/components/common/modal-dialog/modal-dialog.component';
import { SpecialValidators } from 'ish-shared/forms/validators/special-validators';

/**
 * The Line Item Edit Dialog Container Component displays an edit-dialog of a line items to edit quantity and variation.
 * It provides optional edit functionality
 * It provides optional modalDialogRef-handling
 *
 * @example
 * <ish-line-item-edit-dialog
 *   [lineItem]="lineItem"
 *   [modalDialogRef]="modalDialogRef"
 *   (updateItem)="onUpdateItem($event)"
 * ></ish-line-item-edit-dialog>
 */
@Component({
  selector: 'ish-line-item-edit-dialog',
  templateUrl: './line-item-edit-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineItemEditDialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() lineItem: LineItemView;
  @Input() modalDialogRef?: ModalDialogComponent<unknown>;
  @Output() updateItem = new EventEmitter<LineItemUpdate>();

  variation$: Observable<VariationProductView>;
  loading$: Observable<boolean>;

  form = new FormGroup({
    quantity: new FormControl(undefined, [
      Validators.required,
      // Validators.max(this.lineItem.product.maxOrderQuantity),
      SpecialValidators.integer,
    ]),
  });

  private destroy$ = new Subject();

  constructor(private context: ProductContextFacade) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lineItem && this.lineItem) {
      this.form.patchValue({ quantity: this.lineItem.quantity.value });
      this.context.set('sku', () => this.lineItem.productSKU);
    }
  }

  ngOnInit() {
    this.variation$ = this.context.select('productAsVariationProduct');

    this.loading$ = this.context.select('loading');

    this.variation$.pipe(takeUntil(this.destroy$)).subscribe(product => {
      if (this.modalDialogRef) {
        this.modalDialogRef.options.confirmDisabled = !product.availability || !product.inStock || false;
      }
    });

    this.initModalDialogConfirmed();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * register subscription to modalDialogRef.confirmed (modalDialog-submit-button)
   */
  private initModalDialogConfirmed() {
    if (this.modalDialogRef) {
      this.modalDialogRef.confirmed.pipe(takeUntil(this.destroy$)).subscribe(() => {
        const data: LineItemUpdate = {
          itemId: this.lineItem.id,
          quantity: +this.form.get('quantity').value,
          sku: this.context.get('sku'),
        };
        this.updateItem.emit(data);
      });
    }
  }
}
