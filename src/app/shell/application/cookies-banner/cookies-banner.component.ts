import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TransferState } from '@angular/platform-browser';

import { COOKIE_CONSENT_OPTIONS } from 'ish-core/configurations/injection-keys';
import { COOKIE_CONSENT_VERSION } from 'ish-core/configurations/state-keys';
import { CookieConsentOptions, CookieConsentSettings } from 'ish-core/models/cookies/cookies.model';
import { CookiesService } from 'ish-core/services/cookies/cookies.service';

/**
 * Cookies Banner Component
 */
@Component({
  selector: 'ish-cookies-banner',
  templateUrl: './cookies-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiesBannerComponent implements OnInit {
  showBanner = false;

  // tslint:disable:no-intelligence-in-artifacts
  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    @Inject(COOKIE_CONSENT_OPTIONS) private cookieConsentOptions: CookieConsentOptions,
    private transferState: TransferState,
    private cookiesService: CookiesService
  ) {}

  ngOnInit() {
    this.showBannerIfNecessary();
  }

  /**
   * Shows the cookie consent banner if the cookie consent was not given
   * or if the expected cookie consent version is higher than the given cookie consent version.
   */
  showBannerIfNecessary() {
    if (isPlatformBrowser(this.platformId)) {
      const cookieConsentSettings = JSON.parse(
        this.cookiesService.get('cookieConsent') || 'null'
      ) as CookieConsentSettings;
      const cookieConsentVersion = this.transferState.get<number>(COOKIE_CONSENT_VERSION, 1);
      if (!cookieConsentSettings || cookieConsentSettings.version < cookieConsentVersion) {
        this.showBanner = true;
      }
    }
  }

  acceptAll() {
    console.log('cookieConsentOptions', this.cookieConsentOptions);
    this.cookiesService.setCookiesPreferences(['required', 'functional', 'tracking']);
  }
}
