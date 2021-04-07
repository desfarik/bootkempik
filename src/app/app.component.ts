import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {slideInAnimation} from './animations';
import {ApiService} from './service/api.service';
import {StatusAppService} from './service/status-app.service';
import {SwUpdate} from '@angular/service-worker';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {switchMap, tap} from "rxjs/operators";

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

    constructor(apiService: ApiService,
                public statusAppService: StatusAppService,
                private changeDetectorRef: ChangeDetectorRef,
                private dialog: MatDialog,
                swUpdate: SwUpdate) {
        this.initApp(apiService);
        swUpdate.available
            .pipe(switchMap(this.showUpdateDialog))
            .subscribe(event => {
                console.log(event);
                swUpdate.activateUpdate().then(() => document.location.reload());
            });
    }

    private showUpdateDialog = () => {
        return this.dialog.open(UpdateAvailableDialog,
            {
                disableClose: true,
            }
        ).afterClosed();
    }

    private async initApp(apiService: ApiService) {
        try {
            await apiService.getUp();
            this.statusAppService.setWorkMode();
        } catch (e) {
            this.statusAppService.setErrorMode();
        }
        this.changeDetectorRef.detectChanges();
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
