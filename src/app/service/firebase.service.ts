import {Injectable} from '@angular/core';
import '@firebase/database';
import firebase from '../../../node_modules/firebase';
import {UserService} from './user.service';
import {firebaseConfig} from '../../../firebase.config';
import {MoneyPerPerson, Note} from '../private/add-new-note/note';
import {BalanceService} from './balance.service';
import {CacheService} from './cache.service';
import {ApiService} from './api.service';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    public userService: UserService;
    public balanceService: BalanceService;
    private database: firebase.database.Database;
    private cachedNotesSnapshot: any;

    constructor(cacheService: CacheService, private apiService: ApiService) {
        const app = firebase.initializeApp(firebaseConfig);
        this.database = firebase.database(app);
        this.userService = new UserService(this.database, apiService);
        this.balanceService = new BalanceService(this.database, cacheService, apiService);
        this.put();
    }

    public put() {
        this.database.ref('/bla').push({bla: 2}).then((r) => {
            console.log(r);
        });
    }

    public getAllNotes(): Promise<Note[]> {
        return this.database.ref('/notes').once('value').then(snapshot => {
            this.cachedNotesSnapshot = snapshot.val();
            return (Object.values(this.cachedNotesSnapshot) as Note[]);
        });
    }


    public async updateNotes(notes: Note[]): Promise<void> {
        const entries = Object.entries(this.cachedNotesSnapshot);
        const promises = [];
        for (let index = 0; index < entries.length; index++) {
            const [key, note] = entries[index];
            const updatedNote = notes.find(n => n.nowDate === (note as Note).nowDate);
            if (updatedNote) {
                promises.push(this.database.ref(`/notes/${key}`).set(updatedNote));
            }
        }
        await Promise.all(promises);
    }

    public async getUserNotes(userId: number, userId2: number): Promise<Note[]> {
        const allNotes = await this.getAllNotes();
        console.log(allNotes);
        return allNotes.filter(note => {
            if (note.ownerId === userId) {
                return note.moneyPerPerson.find((moneyPerPerson: MoneyPerPerson) => moneyPerPerson.personId === userId2);
            }
            if (note.ownerId === userId2) {
                return note.moneyPerPerson.find((moneyPerPerson: MoneyPerPerson) => moneyPerPerson.personId === userId);
            }
            return false;
        });
    }
}
