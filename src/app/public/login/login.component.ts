import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthorizationService} from "../../service/authorization.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private authService: AuthorizationService) {
  }

  public ngOnInit(): void {

  }

  private authConf = {
    clientID: '6754021',
    domain: location.origin,
    responseType: 'token',
    redirectUri: location.origin,
    scope: '',
  };


  public getUrl(): string {
    return `https://oauth.vk.com/authorize?client_id=${this.authConf.clientID}&group_ids=&display=page&redirect_uri=${this.authConf.redirectUri}/main&`
      + `scope=${this.authConf.scope}&response_type=token&v=5.95`
  }

  public loginLike(index: number): void {
    this.authService.authorize(users[index], "token");
    this.authService.saveVkTokenAndId("token", users[index].id);
    this.router.navigate(['/']);
  }

}

const users = [{
  "first_name": "Никита",
  "id": 20484829,
  "last_name": "Лушпа",
  "photo_200_orig": "https://sun9-64.userapi.com/c857736/v857736258/2014/RnR9IKeVDhk.jpg?ava=1"
},
  {
    "first_name": "Дима",
    "id": 46419003,
    "last_name": "Астрейко",
    "photo_200_orig": "https://sun9-28.userapi.com/c626229/v626229003/13bf/lzjBiMg__0g.jpg?ava=1"
  },
  {
    "first_name": "Жека",
    "id": 95745445,
    "last_name": "Титков",
    "photo_200_orig": "https://sun9-51.userapi.com/c834203/v834203741/131f66/7HvvI7HHeBE.jpg?ava=1"
  }]
