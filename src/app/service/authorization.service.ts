import {Injectable} from '@angular/core';
import {User} from './model/user';


const USER = 'user';
const USER_ID = 'user_id';
const VK_TOKEN = 'vk_token';

@Injectable({
    providedIn: 'root'
})
export class AuthorizationService {


    public static getVkToken(): string {
        return localStorage.getItem(VK_TOKEN);
    }

    public static getUserId(): number {
        return Number(localStorage.getItem(USER_ID));
    }

    public logout(): void {
        localStorage.clear();
    }

    public getCurrentUser(): User {
        return JSON.parse(localStorage.getItem(USER));
    }

    public authorize(user: User, token: string): void {
        localStorage.setItem(USER, JSON.stringify(user));
        localStorage.setItem(VK_TOKEN, token);
    }

    public isAuthorized(): boolean {
        return !!localStorage.getItem(VK_TOKEN) && !!localStorage.getItem(USER);
    }

    public saveVkTokenAndId(token, userId): void {
        localStorage.setItem(VK_TOKEN, token);
        localStorage.setItem(USER_ID, userId);
    }
}
