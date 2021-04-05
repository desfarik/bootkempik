import {Injectable} from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/database';
import {UserService} from './user.service';
import {firebaseConfig} from '../../../firebase.config';
import {AllNotes} from '../private/add-new-note/note';
import {BalanceService} from './balance.service';
import {CacheService} from './cache.service';
import {ApiService} from './api.service';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    public userService: UserService;
    public balanceService: BalanceService;
    private readonly database: firebase.database.Database;

    constructor(cacheService: CacheService, private apiService: ApiService) {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.userService = new UserService(this.database, apiService);
        this.balanceService = new BalanceService(this.database, cacheService, apiService);
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

    private getAllNotes(): Promise<AllNotes> {
        return this.database.ref('/notes').once('value').then(snapshot => {
            return snapshot.val() as AllNotes;
        });
    }
}
