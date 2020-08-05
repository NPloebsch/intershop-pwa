import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export interface IdentityProviderCapabilities {
  editPassword?: boolean;
  editEmail?: boolean;
}

export interface IdentityProvider {
  init(config): void;

  getCapabilities(): IdentityProviderCapabilities;

  triggerLogin(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

  triggerRegister?(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

  triggerLogout(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>;
}
