import {ApiService} from './api.service';
import firebase from 'firebase';
import {messagingKey} from '../../../firebase.config';
import {AuthorizationService} from './authorization.service';
import {SnackBarService} from "./snack-bar.service";

export class NotificationService {

    constructor(private apiService: ApiService,
                private messaging: firebase.messaging.Messaging,
                private snackBarService: SnackBarService) {
        this.messaging.onMessage((message) => {
            console.log(message);
            this.snackBarService.showInfo(message.notification.title, 'OK');
        });
    }

    public async enableNotifications() {
        try {
            const token = await this.messaging.getToken({vapidKey: messagingKey});
            await this.register(token, AuthorizationService.getUserId());
            console.log('notification is enabled');
        } catch (e) {
            console.log(e);
        }
    }

    public async disableNotifications() {
        try {
            const result = await this.messaging.deleteToken();
            await this.unregister(AuthorizationService.getUserId());
            console.log('notification token is deleted: ' + result);
        } catch (e) {
            console.log(e);
        }
    }

    private register(token, userId: number): Promise<void> {
        return this.apiService.post('/user/push/register', {token, userId});
    }

    private unregister(userId: number): Promise<void> {
        return this.apiService.post('/user/push/unregister', {userId});
    }

    public cannotEnableOnOldBrowser(): void {
        this.apiService.post('/cannot/enable/notification/old-browser', undefined);
    }

    public blockNotification(): void {
        this.apiService.post('/block/notification', undefined);
    }

    public tryToEnableBlockedNotification(): void {
        this.apiService.post('/enable/blocked/notification', undefined);
    }
}

