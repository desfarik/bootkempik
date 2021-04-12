import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../service/authorization.service';
import {Router} from '@angular/router';
import {User} from '../../service/model/user';
import {VkUserService} from '../../service/vk.user.service';
import {FirebaseService} from '../../service/firebase.service';
import {StatusAppService} from '../../service/status-app.service';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {SnackBarService} from '../../service/snack-bar.service';

const IS_ENABLED_NOTIFICATIONS = 'is_enabled_notifications';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    public loading = true;
    public isEnabledNotifications = JSON.parse(localStorage.getItem(IS_ENABLED_NOTIFICATIONS));

    constructor(private authorizationService: AuthorizationService,
                private router: Router,
                private vkUserService: VkUserService,
                private firebaseService: FirebaseService,
                private snackBarService: SnackBarService,
                public statusAppService: StatusAppService) {
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

    async onToggleChange(event: MatSlideToggleChange) {
        if (event.checked) {
            if (await this.checkPermission()) {
                await this.firebaseService.notificationService.enableNotifications();
                this.isEnabledNotifications = event.checked;
                this.snackBarService.showSuccess('Уведомления успешно включены', 'OK');
            } else {
                this.isEnabledNotifications = true;
                setTimeout(() => {
                    this.isEnabledNotifications = false;
                    localStorage.setItem(IS_ENABLED_NOTIFICATIONS, `${this.isEnabledNotifications}`);
                });
            }
        } else {
            await this.firebaseService.notificationService.disableNotifications();
            this.isEnabledNotifications = false;
            this.snackBarService.showInfo('Сейчас бы отключать уведомления...', 'OK');
        }
        localStorage.setItem(IS_ENABLED_NOTIFICATIONS, `${this.isEnabledNotifications}`);
    }

    private async checkPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            this.snackBarService.showError('Ваш браузер не поддерживает уведомления...', 'Okay');
            this.firebaseService.notificationService.cannotEnableOnOldBrowser();
            return false;
        }
        if (Notification.permission === 'granted') {
            return Promise.resolve(true);
        }
        if (Notification.permission === 'denied') {
            this.snackBarService.showInfo('Вы заблокировали уведомления в браузере, разблокируйте их чтобы включить уведомления', 'OК');
            this.firebaseService.notificationService.tryToEnableBlockedNotification();
            return Promise.resolve(false);
        }
        return Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                return true;
            }
            this.snackBarService.showError('Я очень огорчен что Вы заблокировали нотификации...', 'Пошел ты');
            this.firebaseService.notificationService.blockNotification();
            return false;
        });
    }
}
