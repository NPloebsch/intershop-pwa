import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

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
  // constructor(private cookieFacade: CookieFacade) {}

  ngOnInit() {
    console.log('cookies banner inited');
    // this.cookieData = JSON.parse(this.cookieFacade.cookiesService.get('cookie-consent') || 'null');
    // this.showBannerIfNeeded();
    // this.initCookieLawSeen();
  }

  // initCookieLawSeen() {
  //   if (this.cookieData?.enabledCookies.includes('tracking')) {
  //     this.cookieFacade.cookiesService.cookieLawSeen$.next(true);
  //   }
  // }

  // showBannerIfNeeded() {
  //   if (this.cookieData?.updatedAt) {
  //     const updatedAtCookie = new Date(this.cookieData.updatedAt).getTime();
  //     const updatedAtOptions = new Date(this.options.updatedAt).getTime();

  //     if (updatedAtOptions - updatedAtCookie < 0) {
  //       this.showBanner = false;
  //     }
  //   }
  // }

  // acceptAll() {
  //   this.saveAndReload(this.options.options.map(x => x.id));
  // }

  // saveAndReload(enabledCookies: string[]) {
  //   this.deleteAllCookies();
  //   this.cookieData = { updatedAt: new Date().toISOString(), enabledCookies };
  //   this.cookieFacade.cookiesService.put('cookie-consent', JSON.stringify(this.cookieData));
  //   window.location.reload();
  // }

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
