import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

import { COOKIE_CONSENT_OPTIONS } from 'ish-core/configurations/injection-keys';
import { CookieConsentOptions } from 'ish-core/models/cookies/cookies.model';
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
    @Inject(COOKIE_CONSENT_OPTIONS) private cookieConsentOptions: CookieConsentOptions,
    private cookiesService: CookiesService
  ) {}

  ngOnInit() {
    this.showBannerIfNecessary();
  }

  /**
   * Shows the cookie consent banner if the cookie consent was not given
   * or if the cookie options are newer than the given cookie consent.
   */
  showBannerIfNecessary() {
    const cookieConsentSettings = JSON.parse(this.cookiesService.get('cookieConsent') || 'null');
    if (
      !cookieConsentSettings ||
      new Date(this.cookieConsentOptions.updatedAt).getTime() - new Date(cookieConsentSettings.updatedAt).getTime() > 0
    ) {
      this.showBanner = true;
    }
  }

  acceptAll() {
    this.cookiesService.setCookiesPreferences(['required', 'functional', 'tracking']);
  }
}
