import { isPlatformBrowser } from '@angular/common';
import { ApplicationRef, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { Observable, ReplaySubject, Subject, combineLatest, interval, of } from 'rxjs';
import {
  concatMapTo,
  distinctUntilChanged,
  filter,
  first,
  map,
  mapTo,
  pairwise,
  skip,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { CookiesService } from 'ish-core/services/cookies/cookies.service';
import { getCurrentBasket, loadBasket } from 'ish-core/store/customer/basket';
import { getSelectedOrderId } from 'ish-core/store/customer/orders';
import { getLoggedInUser } from 'ish-core/store/customer/user';
import { mapToProperty, whenTruthy } from 'ish-core/utils/operators';

type ApiTokenCookieType = 'user' | 'basket' | 'order';

interface ApiTokenCookie {
  apiToken: string;
  type: ApiTokenCookieType;
  orderId?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiTokenService {
  apiToken$ = new ReplaySubject<string>(1);
  initialCookie$: Observable<ApiTokenCookie>;
  cookieVanishes$ = new Subject<ApiTokenCookieType>();

  constructor(
    private cookiesService: CookiesService,
    @Inject(PLATFORM_ID) platformId: string,
    store: Store,
    appRef: ApplicationRef
  ) {
    const initialCookie = this.parseCookie();
    this.initialCookie$ = of(isPlatformBrowser(platformId) ? initialCookie : undefined);
    this.initialCookie$.pipe(mapToProperty('apiToken')).subscribe(token => {
      this.apiToken$.next(token);
    });

    if (isPlatformBrowser(platformId)) {
      // save token routine
      combineLatest([
        store.pipe(select(getLoggedInUser)),
        store.pipe(select(getCurrentBasket)),
        store.pipe(select(getSelectedOrderId)),
        this.apiToken$.pipe(skip(1)),
      ])
        .pipe(
          map(
            ([user, basket, orderId, apiToken]): ApiTokenCookie => {
              if (user) {
                return { type: 'user', apiToken };
              } else if (basket) {
                return { type: 'basket', apiToken };
              } else if (orderId) {
                return { type: 'order', apiToken, orderId };
              }
            }
          ),
          distinctUntilChanged(isEqual)
        )
        .subscribe(apiToken => {
          const cookieContent = apiToken ? JSON.stringify(apiToken) : undefined;
          if (cookieContent) {
            cookiesService.put('apiToken', cookieContent, {
              expires: new Date(Date.now() + 3600000),
              secure: (isPlatformBrowser(platformId) && location.protocol === 'https:') || false,
            });
          } else {
            cookiesService.remove('apiToken');
          }
        });

      // token vanishes routine
      appRef.isStable
        .pipe(
          whenTruthy(),
          first(),
          concatMapTo(
            interval(1000).pipe(
              map(() => this.parseCookie()),
              pairwise(),
              // trigger only if application token exists but external token vanished
              withLatestFrom(this.apiToken$),
              filter(([[previous, current], apiToken]) => !!previous && !current && !!apiToken),
              map(([[previous]]) => previous.type)
            )
          )
        )
        .subscribe(type => {
          this.apiToken$.next(undefined);
          this.cookieVanishes$.next(type);
        });

      // session keep alive
      appRef.isStable
        .pipe(
          whenTruthy(),
          first(),
          concatMapTo(
            store.pipe(
              select(getCurrentBasket),
              switchMap(basket => interval(10 * 60 * 1000).pipe(mapTo(!!basket)))
            )
          ),
          whenTruthy()
        )
        .subscribe(() => {
          store.dispatch(loadBasket());
        });
    }
  }

  private parseCookie() {
    const cookieContent = this.cookiesService.get('apiToken');
    if (cookieContent) {
      try {
        return JSON.parse(cookieContent);
      } catch (err) {
        // ignore
      }
    }
    return;
  }

  setApiToken(apiToken: string) {
    if (!apiToken) {
      console.warn('do not use setApiToken to unset token, use remove or invalidate instead');
    }
    this.apiToken$.next(apiToken);
  }

  removeApiToken() {
    this.apiToken$.next(undefined);
  }

  invalidateApiToken() {
    const cookie = this.parseCookie();

    this.apiToken$.next(undefined);

    if (cookie) {
      this.cookieVanishes$.next(cookie?.type);
    }
  }
}
