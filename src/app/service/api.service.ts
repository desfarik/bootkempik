import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private httpClient: HttpClient) {
    }

    public getUp(): Promise<void> {
        return this.get('/get-up');
    }

    public get<T>(url: string): Promise<T> {
        return this.httpClient.get<T>(environment.apiUrl + url).toPromise();
    }

    public put<T>(url: string, body): Promise<T> {
        return this.httpClient.put<T>(environment.apiUrl + url, body).toPromise();
    }

    public post<T>(url: string, body): Promise<T> {
        return this.httpClient.post<T>(environment.apiUrl + url, body).toPromise();
    }
}
