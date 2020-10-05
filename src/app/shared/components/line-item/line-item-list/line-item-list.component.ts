import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LineItemUpdate } from 'ish-core/models/line-item-update/line-item-update.model';
import { LineItemView } from 'ish-core/models/line-item/line-item.model';
import { OrderLineItem } from 'ish-core/models/order/order.model';
import { Price } from 'ish-core/models/price/price.model';

/**
 * The Line Item List Component displays a line items.
 * It provides optional delete and edit functionality
 * It provides optional lineItemView (string 'simple')
 * It provides optional total cost output
 *
 * @example
 * <ish-line-item-list
 *   [lineItems]="lineItems"
 *   [editable]="editable"
 *   [total]="total"
 *   lineItemViewType="simple"  // simple = no edit-button, inventory, shipment
 *   (updateItem)="onUpdateItem($event)"
 *   (deleteItem)="onDeleteItem($event)"
 * ></ish-line-item-list>
 */
@Component({
  selector: 'ish-line-item-list',
  templateUrl: './line-item-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineItemListComponent {
  @Input() lineItems: Partial<LineItemView & OrderLineItem>[];
  @Input() editable = true;
  @Input() total: Price;
  @Input() lineItemViewType?: 'simple' | 'availability';

  @Output() updateItem = new EventEmitter<LineItemUpdate>();
  @Output() deleteItem = new EventEmitter<string>();

  onUpdateItem(item: LineItemUpdate) {
    this.updateItem.emit(item);
  }

  onDeleteItem(itemId: string) {
    this.deleteItem.emit(itemId);
  }

  trackByFn(_, item: LineItemView) {
    return item.productSKU;
  }
}
