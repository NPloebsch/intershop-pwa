import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

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
  showBanner = true;

  // tslint:disable-next-line:no-intelligence-in-artifacts
  constructor(private cookiesService: CookiesService) {}

  ngOnInit() {
    console.log('cookies banner inited', this.cookiesService.get('cookie-consent'));

    if (this.cookiesService.get('cookie-consent')) {
      this.showBanner = false;
    }

    // this.cookieData = JSON.parse(this.cookieFacade.cookiesService.get('cookie-consent') || 'null');
    // this.showBannerIfNeeded();
  }
  // showBannerIfNeeded() {
  //   if (this.cookieData?.updatedAt) {
  //     const updatedAtCookie = new Date(this.cookieData.updatedAt).getTime();
  //     const updatedAtOptions = new Date(this.options.updatedAt).getTime();

  //     if (updatedAtOptions - updatedAtCookie < 0) {
  //       this.showBanner = false;
  //     }
  //   }
  // }

  acceptAll() {
    this.cookiesService.setCookiesPreferences(['required', 'functional', 'tracking']);
  }
}
