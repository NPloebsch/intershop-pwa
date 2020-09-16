import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CookiesService } from 'ish-core/services/cookies/cookies.service';

export interface CookieBannerOptions {
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

export interface CookieBannerCookiedata {
  updatedAt: Date | string;
  enabledCookies: string[]; // ids 'required' | 'marketing' | 'tracking'
}

/**
 * Cookie Modal Component
 */
@Component({
  selector: 'ish-cookies-modal',
  templateUrl: './cookies-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiesModalComponent implements OnInit {
  @Input() options: CookieBannerOptions = {
    updatedAt: 'Mon Jul 27 2020 12:03:39 GMT+0200',
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

  cookieData?: CookieBannerCookiedata;

  @Output() close = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<string[]>();

  selectedIds = {};

  // tslint:disable-next-line:no-intelligence-in-artifacts
  constructor(private cookiesService: CookiesService) {}

  ngOnInit() {
    this.cookieData = JSON.parse(this.cookiesService.get('cookie-consent') || 'null');
    this.options.options.map(x =>
      x.required || this.cookieData?.enabledCookies.includes(x.id) ? (this.selectedIds[x.id] = true) : undefined
    );
  }

  submit() {
    this.onChange.emit(
      Object.keys(this.selectedIds).reduce((acc, x) => (this.selectedIds[x] ? acc.push(x) && acc : acc), [])
    );
    this.hide();
  }

  hide() {
    this.close.emit();
  }
}
