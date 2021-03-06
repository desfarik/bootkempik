import {ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {slideInAnimation} from './animations';
import {ApiService} from './service/api.service';
import {StatusAppService} from './service/status-app.service';
import {SwUpdate} from '@angular/service-worker';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {filter, finalize, switchMap, tap} from 'rxjs/operators';
import {version} from './../../package.json';
import {FirebaseService} from './service/firebase.service';
import {race, timer} from 'rxjs';
import {SnackBarService} from './service/snack-bar.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [ // <-- add your animations here
        slideInAnimation
    ]
})
export class AppComponent {
    title = 'bootkempik';

    loading = false;

    @ViewChild('errorMessage')
    public errorMessage: ElementRef<HTMLElement>;

    constructor(private apiService: ApiService,
                private firebaseService: FirebaseService,
                public statusAppService: StatusAppService,
                private changeDetectorRef: ChangeDetectorRef,
                private dialog: MatDialog,
                private snackBarService: SnackBarService,
                swUpdate: SwUpdate) {
        console.log(`app version: ${version}`);
        this.checkBackendStatus();
        this.onChangeAppVersion()
            .pipe(
                switchMap(this.showUpdateDialog),
                tap(this.showLoader),
                tap(() => swUpdate.checkForUpdate()),
                switchMap(() => race(swUpdate.available, timer(15000))),
                finalize(() => document.location.reload())
            )
            .subscribe(() => {
                swUpdate.activateUpdate().then(() => document.location.reload());
            });
    }

    private onChangeAppVersion() {
        return this.firebaseService.onChangeAppVersion.pipe(
            filter((newVersion) => newVersion !== version));
    }

    private showUpdateDialog = () => {
        return this.dialog.open(UpdateAvailableDialog,
            {
                disableClose: true,
            }
        ).afterClosed();
    }

    private showLoader = () => {
        this.loading = true;
    }

    private async checkBackendStatus() {
        try {
            await this.apiService.getUp();
            if (this.statusAppService.isErrorMode) {
                this.snackBarService.showSuccess('Связь успешно восстановлена', 'OK');
            }
            this.statusAppService.setWorkMode();
        } catch (e) {
            this.statusAppService.setErrorMode();
            this.showReadonlyError();
        } finally {
            this.loading = false;
            this.changeDetectorRef.detectChanges();
        }
    }

    private showReadonlyError() {
        this.snackBarService.showReadonlyError().then(() => {
            this.loading = true;
            this.changeDetectorRef.detectChanges();
            this.checkBackendStatus();
        });
    }

    public prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }
}

@Component({
    selector: 'update-available-dialog',
    templateUrl: './update-available.dialog.html',
})
export class UpdateAvailableDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
}
