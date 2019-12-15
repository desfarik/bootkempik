import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {AuthorizationService} from "../../service/authorization.service";
import {Router} from "@angular/router";
import {User} from "../../service/model/user";
import {VkUserService} from "../../service/vk.user.service";
import {FirebaseService} from "../../service/firebase.service";
import {Subscription} from "rxjs";
import {AllBalance} from "../balance/balance";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public selected: FormControl = new FormControl(0);

  public tabNames = {0: "Статистика", 1: "История", 2: 'Мой баланс'};
  public hashNames = {0: "stat", 1: "history", 2: 'balance'};

  public allBalance: AllBalance;
  public allUsers: User[];
  public me: User;

  constructor(private authorizationService: AuthorizationService, private router: Router, private vkUserService: VkUserService, private firebaseService: FirebaseService) {
  }

  private subscription: Subscription;

  async ngOnInit() {
    window.onhashchange = () => this.onHashChange();
    if (location.hash) {
      const result = location.hash.match(/#access_token=(.*?)&.*user_id=(.*?)$/);
      this.subscription = this.firebaseService.balanceService.onAllBalanceUpdate.subscribe(update => this.allBalance = update);
      this.allBalance = this.firebaseService.balanceService.getAllBalances();
      this.me = this.authorizationService.getCurrentUser();
      this.allUsers = await this.firebaseService.userService.getAllUsers();
      if (!result) {
        this.onHashChange();
        return;
      }
      const [, token, userId] = result;
      this.authorizationService.saveVkTokenAndId(token, userId);

      this.vkUserService.getUserInfo(userId)
        .then(async (vkUser) => {
          const user = new User(vkUser);
          await this.firebaseService.userService.saveUser(new User(user));
          this.authorizationService.authorize(user, token);
          location.hash = '';
          this.me = this.authorizationService.getCurrentUser();
        })
        .catch((e) => {
          alert(e);
        });
    }
  }

  private onHashChange(): void {
    const index = Object.values(this.hashNames).indexOf(location.hash.slice(1));
    if (index >= 0 && this.selected.value !== index) {
      this.selected.setValue(index);
    }
  }

  public onChangeTabIndex(index): void {
    this.selected.setValue(index);
    location.hash = this.hashNames[index];
  }

  public logout() {
    this.authorizationService.logout();
    this.router.navigateByUrl('login');
  }

}
