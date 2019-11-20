import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {AuthorizationService} from '../authorization.service';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TokenGuard implements CanActivateChild {
  constructor(private authorizationService: AuthorizationService, private router: Router) {
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authorizationService.isAuthorized()) {
      return true;
    }
    this.router.navigateByUrl('/login');
    return false;
  }
}
