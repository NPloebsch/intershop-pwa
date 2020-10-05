import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { LineItemUpdate } from 'ish-core/models/line-item-update/line-item-update.model';
import { LineItemView } from 'ish-core/models/line-item/line-item.model';
import { VariationProductView } from 'ish-core/models/product-view/product-view.model';

/**
 * The Line Item Edit Component displays an edit-link and edit-dialog.
 * It prodives optional edit functionality
 *
 * @example
 * <ish-line-item-edit
 *   [lineItem]="lineItem"
 *   [editable]="editable"
 *   (updateItem)="onUpdateItem($event)"
 * ></ish-line-item-edit>
 */
@Component({
  selector: 'ish-line-item-edit',
  templateUrl: './line-item-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductContextFacade],
})
export class LineItemEditComponent implements OnChanges, OnInit {
  @Input() lineItem: LineItemView;
  @Output() updateItem = new EventEmitter<LineItemUpdate>();

  product$: Observable<VariationProductView>;

  constructor(private context: ProductContextFacade) {}

  onUpdateItem(event: LineItemUpdate) {
    this.updateItem.emit(event);
  }

  ngOnChanges() {
    this.context.set('sku', () => this.lineItem.productSKU);
  }

  ngOnInit() {
    this.product$ = this.context.select('productAsVariationProduct');
  }
}
