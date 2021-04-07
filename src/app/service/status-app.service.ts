import {ChangeDetectorRef, Injectable} from '@angular/core';


const ERROR_MODE = 'error-mode';

@Injectable({
    providedIn: 'root'
})
export class StatusAppService {
    private errorMode = JSON.parse(localStorage.getItem(ERROR_MODE));

    public get isErrorMode() {
        return this.errorMode;
    }

    constructor() {
    }

    setWorkMode() {
        this.errorMode = false;
        localStorage.setItem(ERROR_MODE, 'false');
    }

    setErrorMode() {
        this.errorMode = true;
        localStorage.setItem(ERROR_MODE, 'true');
    }
}
