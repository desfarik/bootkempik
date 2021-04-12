import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthorizationService} from '../service/authorization.service';

@Injectable()
export class CookieInterceptor implements HttpInterceptor {

    constructor() {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const headers = new HttpHeaders({
            'custom-analytic': AuthorizationService.getUserId() + ''
        });
        const newRequest = request.clone({
            headers,
        });
        return next.handle(newRequest);

    }
}
