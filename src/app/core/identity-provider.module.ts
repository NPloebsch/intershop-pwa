import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { OAuthModule } from 'angular-oauth2-oidc';
import { first, tap } from 'rxjs/operators';

import { getIdentityProvider } from './store/core/configuration';
import { Auth0IdentityProvider } from './utils/identity-provider/auth0.identity-provider';
import { ICMIdentityProvider } from './utils/identity-provider/icm.identity-provider';
import {
  IDENTITY_PROVIDER_IMPLEMENTOR,
  IdentityProviderFactory,
} from './utils/identity-provider/identity-provider.factory';
import { whenTruthy } from './utils/operators';

export function identityProviderFactoryInitializer(store: Store, identityProviderFactory: IdentityProviderFactory) {
  return () =>
    store
      .pipe(
        select(getIdentityProvider),
        whenTruthy(),
        first(),
        tap(config => identityProviderFactory.init(config))
      )
      .toPromise();
}

@NgModule({
  imports: [OAuthModule.forRoot({ resourceServer: { sendAccessToken: false } })],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: identityProviderFactoryInitializer,
      deps: [Store, IdentityProviderFactory],
      multi: true,
    },
    {
      provide: IDENTITY_PROVIDER_IMPLEMENTOR,
      multi: true,
      useValue: {
        type: 'ICM',
        implementor: ICMIdentityProvider,
      },
    },
    {
      provide: IDENTITY_PROVIDER_IMPLEMENTOR,
      multi: true,
      useValue: {
        type: 'auth0',
        implementor: Auth0IdentityProvider,
      },
    },
  ],
})
export class IdentityProviderModule {}
