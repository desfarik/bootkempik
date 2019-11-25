import {Injectable} from '@angular/core';
import {firebase} from '@firebase/app';
import {UserService} from './user.service';
import {firebaseConfig} from '../../../firebase.config';
import '@firebase/database';
import '@firebase/functions';
import {AllNotes, Note} from '../private/add-new-note/note';
import {HistoryService} from './history.service';
import {BalanceService} from './balance/balance.service';
import {AllBalance, Balance} from '../private/balance/balance';
import Dexie from 'dexie';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    public userService: UserService;
    public historyService: HistoryService;
    public balanceService: BalanceService;
    private functions: firebase.functions.Functions;
    private database: firebase.database.Database;
    private offlineDatabase: OfflineDatabase;


    constructor() {
        firebase.initializeApp(firebaseConfig);
        // @ts-ignore
        try {
            this.offlineDatabase = new OfflineDatabase();
        } catch (e) {
            alert('Возникла ошибка версий баз данных, страница будет перезагружена');
            window.indexedDB.deleteDatabase('OfflineDatabase');
            window.indexedDB.deleteDatabase('BalanceDatabase');
            document.location.reload();
        }
        this.database = firebase.database();
        this.functions = firebase.functions();
        this.userService = new UserService(this.database, this.functions);
        this.historyService = new HistoryService(this.database, this.functions, this.offlineDatabase);
        this.balanceService = new BalanceService(this.database, this.functions, this.offlineDatabase);
    }
}


export class OfflineDatabase extends Dexie {
    public balances: Dexie.Table<Balance, string>;
    public notes: Dexie.Table<Note, string>;

    public constructor() {
        super('OfflineDatabase');
        this.version(11).stores({
            balance: '',
            notes: ''
        });
        this.balances = this.table('balance');
        this.notes = this.table('notes');
    }

    public loadAllBalances(balances: AllBalance) {
        this.balances.bulkPut(Object.values(balances), Object.keys(balances) as any);
    }

    public loadAllNotes(allNotes: AllNotes) {
        this.notes.bulkPut(Object.values(allNotes), Object.keys(allNotes) as any);
    }

    public async addNewNote(newNote: Note) {
        await this.notes.put(newNote, new Date().getTime().toString());
        await this.notes.put(newNote.nowDate as any, 'lastUpdateDate');
    }

    public async getAllBalances(): Promise<AllBalance> {
        const allBalance = {};
        await this.balances.each((balance, cursor) => {
            // @ts-ignore
            allBalance[cursor.key] = balance;
        });
        return allBalance as AllBalance;
    }

    public async getAllNotes(): Promise<AllNotes> {
        const allNotes = {};
        await this.notes.each((note, cursor) => {
            // @ts-ignore
            allNotes[cursor.key] = note;
        });
        return allNotes as AllNotes;
    }
}
