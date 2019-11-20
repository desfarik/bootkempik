import {Injectable} from "@angular/core";
import {AuthorizationService} from "./authorization.service";
import {User} from "./model/user";

@Injectable({
  providedIn: 'root'
})
export class VkUserService {

  constructor() {

  }

  public getUserInfo(userId: string): Promise<User> {
    return this.send('users.get', `user_ids=${userId}&fields=photo_200_orig`)
      .then(users => {
        if (users) {
          return users[0];
        } else {
          throw new Error('user info error');
        }
      }) as Promise<User>;
  }

  private send(method: string, args: string) {
    return new Promise(((resolve) => {
      this.jsonp(`https://api.vk.com/method/${method}?${args}&access_token=${AuthorizationService.getVkToken()}&v=5.95`, result => resolve(result.response));
    }));
  }

  private jsonp(url, callback) {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function (data) {
      delete window[callbackName];
      document.body.removeChild(script);
      callback(data);
    };

    const script = document.createElement('script') as HTMLScriptElement;
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
  }
}

export interface IList<T> {
  count: number,
  items: T[]
}
