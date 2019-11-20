import {Component, OnInit} from '@angular/core';
import {VkUserService} from "../../service/vk.user.service";
import {User} from "../../service/model/user";
import {FirebaseService} from "../../service/firebase.service";
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

}
