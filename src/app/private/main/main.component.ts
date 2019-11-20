import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {AuthorizationService} from "../../service/authorization.service";
import {Router} from "@angular/router";
import {User} from "../../service/model/user";
import {VkUserService} from "../../service/vk.user.service";
import {FirebaseService} from "../../service/firebase.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public selected: FormControl = new FormControl(0);

  public tabNames = {0: "Статистика", 1: "История", 2: 'Мой баланс'};

  constructor(private authorizationService: AuthorizationService, private router: Router, private vkUserService: VkUserService, private firebaseService: FirebaseService,) {
  }

  ngOnInit() {
    if (location.hash) {
      const [, token, userId] = location.hash.match(/#access_token=(.*?)&.*user_id=(.*?)$/);
      this.authorizationService.saveVkToken(token);

      this.vkUserService.getUserInfo(userId)
        .then(async (vkUser) => {
          const user = new User(vkUser);
          await this.firebaseService.userService.saveUser(new User(user));
          this.authorizationService.authorize(user, token);
          location.hash = '';
        })
        .catch((e) => {
          alert(e);
        });
    }
  }

  public logout() {
    this.authorizationService.logout();
    this.router.navigateByUrl('login');
  }

}
