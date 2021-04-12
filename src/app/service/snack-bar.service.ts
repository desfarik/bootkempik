import {Injectable, ViewContainerRef} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSnackBarConfig} from '@angular/material/snack-bar/typings/snack-bar-config';
import {finalize} from 'rxjs/operators';
import {MatSnackBarRef} from '@angular/material/snack-bar/typings/snack-bar-ref';
import {SimpleSnackBar} from '@angular/material/snack-bar/typings/simple-snack-bar';

const config: MatSnackBarConfig = {
    duration: 3000,
};


@Injectable({
    providedIn: 'root'
})
export class SnackBarService {

    private readOnlyErrorSnackBar: MatSnackBarRef<SimpleSnackBar>;

    constructor(private snackBar: MatSnackBar) {
    }

    public showReadonlyError(): Promise<void> {
        if (!!this.readOnlyErrorSnackBar) {
            return Promise.resolve();
        }
        this.readOnlyErrorSnackBar = this.snackBar.open('Сервер не отвечает. Приложение работает в readonly режиме', 'RETRY');
        return this.readOnlyErrorSnackBar.onAction()
            .pipe(finalize(() => this.readOnlyErrorSnackBar = undefined))
            .toPromise();
    }


    public showError(message: string, action?: string): void {
        this.snackBar.open(message, action, {
            panelClass: 'error-snack-bar__message',
        });
    }

    public showInfo(message, action?: string): void {
        this.snackBar.open(message, action, {
            ...config,
            panelClass: 'info-snack-bar__message'
        });
    }

    public showSuccess(message, action?: string): void {
        this.snackBar.open(message, action, {
            ...config,
            panelClass: 'success-snack-bar__message'
        });
    }
}
