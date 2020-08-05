import { NgModule } from '@angular/core';

import { ClickOutsideDirective } from './directives/click-outside.directive';
import { IntersectionObserverDirective } from './directives/intersection-observer.directive';
import { ServerHtmlDirective } from './directives/server-html.directive';
import { IdentityProviderCapabilityDirective } from './utils/identity-provider/identity-provider-capability.directive';

@NgModule({
  declarations: [
    ClickOutsideDirective,
    IdentityProviderCapabilityDirective,
    IntersectionObserverDirective,
    ServerHtmlDirective,
  ],
  exports: [
    ClickOutsideDirective,
    IdentityProviderCapabilityDirective,
    IntersectionObserverDirective,
    ServerHtmlDirective,
  ],
})
export class DirectivesModule {}
