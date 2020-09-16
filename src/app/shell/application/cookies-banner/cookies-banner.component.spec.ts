import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockDirective } from 'ng-mocks';
import { instance, mock } from 'ts-mockito';

import { ServerHtmlDirective } from 'ish-core/directives/server-html.directive';
import { CookiesService } from 'ish-core/services/cookies/cookies.service';

import { CookiesBannerComponent } from './cookies-banner.component';

// tslint:disable:no-intelligence-in-artifacts
describe('Cookies Banner Component', () => {
  let component: CookiesBannerComponent;
  let fixture: ComponentFixture<CookiesBannerComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    const cookiesServiceMock = mock(CookiesService);

    await TestBed.configureTestingModule({
      imports: [BrowserTransferStateModule, RouterTestingModule, TranslateModule.forRoot()],
      declarations: [CookiesBannerComponent, MockDirective(ServerHtmlDirective)],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: CookiesService, useValue: instance(cookiesServiceMock) },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiesBannerComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
