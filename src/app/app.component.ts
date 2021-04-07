import {ChangeDetectorRef, Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {slideInAnimation} from "./animations";
import {ApiService} from "./service/api.service";
import {StatusAppService} from "./service/status-app.service";

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

    constructor(apiService: ApiService, public statusAppService: StatusAppService, private changeDetectorRef: ChangeDetectorRef) {
        this.initApp(apiService);
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
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }
}
