import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationStart, NavigationEnd, ParamMap, Router } from '@angular/router';
import { Actions, Effect, ROOT_EFFECTS_INIT, ofType } from '@ngrx/effects';
import { filter, map, mergeMap, take, takeWhile, tap, withLatestFrom } from 'rxjs/operators';

import { StatePropertiesService } from 'ish-core/utils/state-transfer/state-properties.service';
import { SelectLocale } from '../locale';

import { ApplyConfiguration } from './configuration.actions';
import { ConfigurationState } from './configuration.reducer';

@Injectable()
export class ConfigurationEffects {
  constructor(private actions$: Actions, private stateProperties: StatePropertiesService, private router: Router) {}

  @Effect()
  routerWatch$ = this.router.events.pipe(
    takeWhile(event => !(event instanceof NavigationEnd)),
    filter<ActivationStart>(event => event instanceof ActivationStart),
    map(event => event.snapshot),
    tap(snapshot => this.redirectIfNeeded(snapshot)),
    mergeMap(({ paramMap }) => [...this.extractConfigurationParameters(paramMap), ...this.extractLanguage(paramMap)])
  );

  @Effect()
  setInitialRestEndpoint$ = this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    take(1),
    withLatestFrom(
      this.stateProperties.getStateOrEnvOrDefault<string>('ICM_BASE_URL', 'icmBaseURL'),
      this.stateProperties.getStateOrEnvOrDefault<string>('ICM_SERVER', 'icmServer'),
      this.stateProperties.getStateOrEnvOrDefault<string>('ICM_SERVER_STATIC', 'icmServerStatic'),
      this.stateProperties.getStateOrEnvOrDefault<string>('ICM_CHANNEL', 'icmChannel'),
      this.stateProperties.getStateOrEnvOrDefault<string>('ICM_APPLICATION', 'icmApplication'),
      this.stateProperties
        .getStateOrEnvOrDefault<string | string[]>('FEATURES', 'features')
        .pipe(map(x => (typeof x === 'string' ? x.split(/,/g) : x)))
    ),
    map(
      ([, baseURL, server, serverStatic, channel, application, features]) =>
        new ApplyConfiguration({ baseURL, server, serverStatic, channel, application, features })
    )
  );

  extractConfigurationParameters(paramMap: ParamMap) {
    const keys: (keyof ConfigurationState)[] = ['channel', 'baseURL', 'application'];
    const properties: { [id: string]: unknown } = keys
      .filter(key => paramMap.has(key))
      .map(key => ({ [key]: paramMap.get(key) }))
      .reduce((acc, val) => ({ ...acc, ...val }), {});

    if (paramMap.has('features') && paramMap.get('features') !== 'default') {
      if (paramMap.get('features') === 'none') {
        properties.features = [];
      } else {
        properties.features = paramMap.get('features').split(/,/g);
      }
    }

    return Object.keys(properties).length ? [new ApplyConfiguration(properties)] : [];
  }

  extractLanguage(paramMap: ParamMap) {
    return paramMap.has('lang') ? [new SelectLocale({ lang: paramMap.get('lang') })] : [];
  }

  getResolvedUrl(route: ActivatedRouteSnapshot): string {
    const url = route.pathFromRoot.map(v => v.url.map(segment => segment.toString()).join('/')).join('/');
    const params = Object.entries(route.queryParams)
      .map(kvp => kvp.join('='))
      .join('&');
    return url + (params ? '?' + params : '');
  }

  redirectIfNeeded(snapshot: ActivatedRouteSnapshot) {
    if (snapshot.paramMap.has('redirect')) {
      const url = this.getResolvedUrl(snapshot);
      const params = url.match(/\/.*?(;[^?]*).*?/);
      const navigateTo = url.replace(params[1], '');
      return this.router.navigateByUrl(navigateTo);
    }
  }
}