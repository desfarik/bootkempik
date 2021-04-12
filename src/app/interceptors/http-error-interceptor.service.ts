import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, filter} from 'rxjs/operators';
import {SnackBarService} from '../service/snack-bar.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

    constructor(private snackBarService: SnackBarService) {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request)
            .pipe(
                filter(() => !request.url.endsWith('get/up')),
                catchError((error: any) => {
                    console.error(error);
                    if (error?.error?.error) {
                        this.snackBarService.showError(error.error.error, 'Okay');
                    }
                    return throwError(error);
                })
            );
    }
}
