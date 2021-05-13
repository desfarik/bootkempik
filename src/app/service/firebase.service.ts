import {Injectable} from '@angular/core';
import firebase from 'firebase/app';
import {UserService} from './user.service';
import {firebaseConfig} from '../../../firebase.config';
import {AllNotes, Note} from '../private/add-new-note/note';
import {BalanceService} from './balance.service';
import {CacheService} from './cache.service';
import {ApiService} from './api.service';
import {BehaviorSubject} from 'rxjs';
import {version} from './../../../package.json';
import {NotificationService} from './notification.service';
import 'firebase/database';
import 'firebase/messaging';
import {SnackBarService} from "./snack-bar.service";

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    public userService: UserService;
    public balanceService: BalanceService;
    private readonly database: firebase.database.Database;
    public onChangeAppVersion = new BehaviorSubject<string>(version);

    constructor(cacheService: CacheService, private apiService: ApiService) {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.userService = new UserService(this.database, apiService);
        this.balanceService = new BalanceService(this.database, cacheService, apiService);
        this.listenAppVersion();
    }

    private listenAppVersion(): void {
        this.database.ref(`/app-version`).on('value', (snapshot) => {
            this.onChangeAppVersion.next(snapshot.val() as string);
        });
    }

    public async getUserNotes(userId: number, userId2: number): Promise<AllNotes> {
        const allNotes = await this.getAllNotes();
        const userAllNotes = {};
        Object.entries(allNotes).forEach(([noteId, note]) => {
            if (note.ownerId === userId && note.moneyPerPerson[userId2]) {
                userAllNotes[noteId] = {...note};
            }
            if (note.ownerId === userId2 && note.moneyPerPerson[userId]) {
                userAllNotes[noteId] = {...note};
            }
        });
        return userAllNotes;
    }

    public getNoteById(noteId: string): Promise<Note> {
        return this.database.ref(`/notes/${noteId}`).once('value').then(snapshot => {
            return snapshot.val() as Note;
        });
    }

    private getAllNotes(): Promise<AllNotes> {
        return this.database.ref('/notes').once('value').then(snapshot => {
            return snapshot.val() as AllNotes;
        });
    }
}
