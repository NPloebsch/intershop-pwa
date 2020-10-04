import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CookiesOptions, CookiesService as ForeignCookiesService } from 'ngx-utils-cookies-port';

import { COOKIE_CONSENT_OPTIONS } from 'ish-core/configurations/injection-keys';
import {
  CookieConsentCategory,
  CookieConsentOptions,
  CookieConsentSettings,
} from 'ish-core/models/cookies/cookies.model';

@Injectable({ providedIn: 'root' })
export class CookiesService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    @Inject(COOKIE_CONSENT_OPTIONS) private cookieConsentOptions: CookieConsentOptions,
    private cookiesService: ForeignCookiesService
  ) {}

  get(key: string): string {
    return isPlatformBrowser(this.platformId) ? this.cookiesService.get(key) : undefined;
  }

  remove(key: string) {
    this.cookiesService.remove(key);
  }

  put(key: string, value: string, options?: CookiesOptions) {
    this.cookiesService.put(key, value, options);
  }

  setCookiesPreferences(categories: CookieConsentCategory[]) {
    this.deleteAllCookies();
    this.put('cookieConsent', JSON.stringify({ updatedAt: new Date().toISOString(), enabledCookies: categories }));
    window.location.reload();
  }

  cookieConsentFor(category: CookieConsentCategory) {
    if (isPlatformBrowser(this.platformId)) {
      const cookieConsentSettings = JSON.parse(
        this.cookiesService.get('cookieConsent') || 'null'
      ) as CookieConsentSettings;
      return cookieConsentSettings?.enabledCookies.includes(category);
    } else {
      return false;
    }
  }

  private deleteAllCookies() {
    const allCookies = this.cookiesService.getAll();
    for (const cookie in allCookies) {
      if (!this.cookieConsentOptions.allowedCookies.includes(cookie)) {
        this.cookiesService.remove(cookie);
      }
    }
  }
}
