import {Injectable} from '@angular/core';
import {User} from "./model/user";


@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  private USER = 'user';
  private USER_ID = 'user_id';
  private VK_TOKEN = 'vk_token';

  public logout(): void {
    localStorage.clear();
  }

  public getCurrentUser(): User {
    return JSON.parse(localStorage.getItem(this.USER));
  }

  public authorize(user: User, token: string): void {
    localStorage.setItem(this.USER, JSON.stringify(user));
    localStorage.setItem(this.VK_TOKEN, token);
  }

  public isAuthorized(): boolean {
    return !!localStorage.getItem(this.VK_TOKEN) && !!localStorage.getItem(this.USER);
  }

  public static getUser(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  public saveVkTokenAndId(token, userId): void {
    localStorage.setItem(this.VK_TOKEN, token);
    localStorage.setItem(this.USER_ID, userId);
  }

  public static getVkToken(): string {
    return localStorage.getItem('vk_token')
  }

  public getUserId(): number {
    return Number(localStorage.getItem(this.USER_ID));
  }
}
