import {Component, OnInit} from '@angular/core';
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

  public loading = true;

  constructor(private authorizationService: AuthorizationService, private router: Router, private vkUserService: VkUserService, private firebaseService: FirebaseService) {
  }

  async ngOnInit() {
    if (location.hash) {
      const result = location.hash.match(/#access_token=(.*?)&.*user_id=(.*?)$/);
      if (!result) {
        return;
      }
      const [, token, userId] = result;
      this.authorizationService.saveVkTokenAndId(token, userId);

      await this.vkUserService.getUserInfo(userId)
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
    this.loading = false;
  }

  public logout() {
    this.authorizationService.logout();
    this.router.navigateByUrl('login');
  }

}
