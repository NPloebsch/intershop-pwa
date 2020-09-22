import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';

import {
  COOKIE_CONSENT_OPTIONS,
  CookieConsentSettings,
  CookiesService,
} from 'ish-core/services/cookies/cookies.service';

/**
 * Cookie Modal Component
 */
// tslint:disable:no-intelligence-in-artifacts
@Component({
  selector: 'ish-cookies-modal',
  templateUrl: './cookies-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiesModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  cookieConsentOptions = COOKIE_CONSENT_OPTIONS;
  cookieConsentSettings?: CookieConsentSettings;
  selectedIds = {};

  // tslint:disable-next-line:no-intelligence-in-artifacts
  constructor(private cookiesService: CookiesService) {}

  ngOnInit() {
    this.cookieConsentSettings = JSON.parse(this.cookiesService.get('cookie-consent') || 'null');
    COOKIE_CONSENT_OPTIONS.options.map(x =>
      x.required || this.cookieConsentSettings?.enabledCookies.includes(x.id)
        ? (this.selectedIds[x.id] = true)
        : undefined
    );
  }

  submit() {
    this.cookiesService.setCookiesPreferences(
      Object.keys(this.selectedIds).reduce((acc, x) => (this.selectedIds[x] ? acc.push(x) && acc : acc), [])
    );
    this.close.emit();
  }

  hide() {
    this.close.emit();
  }
}
