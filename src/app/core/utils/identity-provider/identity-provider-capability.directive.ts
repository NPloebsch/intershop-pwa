import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { IdentityProviderFactory } from './identity-provider.factory';
import { IdentityProviderCapabilities } from './identity-provider.interface';

@Directive({
  selector: '[ishIdentityProviderCapability]',
})
export class IdentityProviderCapabilityDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private identityProviderFactory: IdentityProviderFactory
  ) {}

  @Input() set ishIdentityProviderCapability(val: keyof IdentityProviderCapabilities) {
    const enabled = this.identityProviderFactory.getInstance().getCapabilities()[val];

    if (enabled) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
