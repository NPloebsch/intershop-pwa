import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CookiesOptions, CookiesService as ForeignCookiesService } from 'ngx-utils-cookies-port';

export interface CookieConsentOptions {
  updatedAt: Date | string;
  options: {
    id: 'required' | 'functional' | 'tracking';
    required?: boolean;
    messageKeyTitle: string;
    messageKeyContent: string;
    features?: string[]; // todo: bind features to ids?!?
    whitelistedCookies?: string[];
  }[];
}

export interface CookieConsentSettings {
  updatedAt: Date | string;
  enabledCookies: string[]; // ids 'required' | 'marketing' | 'tracking'
}

export const COOKIE_CONSENT_OPTIONS: CookieConsentOptions = {
  updatedAt: '2020-09-21T00:00:00',
  options: [
    {
      id: 'required',
      required: true,
      messageKeyTitle: 'cookie_consent.dialog.sections.essential.title',
      messageKeyContent: 'cookie_consent.dialog.sections.essential.content',
      whitelistedCookies: ['apiToken'],
    },
    {
      id: 'functional',
      messageKeyTitle: 'cookie_consent.dialog.sections.functional.title',
      messageKeyContent: 'cookie_consent.dialog.sections.functional.content',
    },
    {
      id: 'tracking',
      messageKeyTitle: 'cookie_consent.dialog.sections.tracking.title',
      messageKeyContent: 'cookie_consent.dialog.sections.tracking.content',
    },
  ],
};

@Injectable({ providedIn: 'root' })
export class CookiesService {
  constructor(private cookiesService: ForeignCookiesService, @Inject(PLATFORM_ID) private platformId: string) {}

  get(key: string): string {
    return isPlatformBrowser(this.platformId) ? this.cookiesService.get(key) : undefined;
  }

  remove(key: string) {
    this.cookiesService.remove(key);
  }

  put(key: string, value: string, options?: CookiesOptions) {
    this.cookiesService.put(key, value, options);
  }

  setCookiesPreferences(categories: string[]) {
    console.log('setCookiesPreferences', categories);
    // this.deleteAllCookies();
    this.put('cookie-consent', JSON.stringify({ updatedAt: new Date().toISOString(), enabledCookies: categories }));
    window.location.reload();
  }

  cookieConsentFor(category: string) {
    const cookieConsentSettings = JSON.parse(this.cookiesService.get('cookie-consent') || 'null');
    return cookieConsentSettings?.enabledCookies.includes(category);
  }

  // deleteAllCookies() {
  //   const cookies = document.cookie.split(';');
  //   for (const cookie of cookies) {
  //     const eqPos = cookie.indexOf('=');
  //     const name = (eqPos > -1 ? cookie.substr(0, eqPos) : cookie).trim();
  //     if (!this.options.options[0].whitelistedCookies.includes(name)) {
  //       document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  //     }
  //   }
  // }
}
