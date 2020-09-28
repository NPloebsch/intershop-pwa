import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { CookiesService as ForeignCookiesService } from 'ngx-utils-cookies-port';
import { instance, mock, verify } from 'ts-mockito';

import { COOKIE_CONSENT_OPTIONS } from 'ish-core/configurations/injection-keys';

import { CookiesService } from './cookies.service';

describe('Cookies Service', () => {
  let cookiesService: CookiesService;
  let foreignCookiesServiceMock: ForeignCookiesService;

  beforeEach(() => {
    foreignCookiesServiceMock = mock(ForeignCookiesService);
    TestBed.configureTestingModule({
      imports: [BrowserTransferStateModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: COOKIE_CONSENT_OPTIONS,
          useValue: {
            options: [
              {
                id: 'required',
                messageKeyTitle: 'required.title',
                messageKeyContent: 'required.content',
                required: true,
              },
              {
                id: 'functional',
                messageKeyTitle: 'functional.title',
                messageKeyContent: 'functional.content',
              },
            ],
          },
        },
        { provide: ForeignCookiesService, useFactory: () => instance(foreignCookiesServiceMock) },
      ],
    });
    cookiesService = TestBed.inject(CookiesService);
  });

  it('should be created', () => {
    expect(cookiesService).toBeTruthy();
  });

  it('should call get of underlying implementation', () => {
    cookiesService.get('dummy');
    verify(foreignCookiesServiceMock.get('dummy')).once();
  });

  it('should call remove of underlying implementation', done => {
    setTimeout(() => {
      cookiesService.remove('dummy');
      verify(foreignCookiesServiceMock.remove('dummy')).once();
      done();
    }, 2000);
  });
});
