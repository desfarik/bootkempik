import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {slideInAnimation} from "./animations";
import {ApiService} from "./service/api.service";

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

    constructor(apiService: ApiService) {
        apiService.getUp();
    }

    public prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }
}
