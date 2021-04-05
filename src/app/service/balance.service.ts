import firebase from '../../../node_modules/firebase/index';
import {AllBalance, Balance} from '../private/balance/balance';
import {BehaviorSubject} from 'rxjs';
import {Note} from '../private/add-new-note/note';
import {CacheService} from './cache.service';
import {ApiService} from './api.service';

export class BalanceService {

    private ALL_BALANCE_KEY = 'all_balance';
    public onAllBalanceUpdate = new BehaviorSubject<AllBalance>(this.getLocalAllBalance());

    constructor(private database: firebase.database.Database,
                private cacheService: CacheService,
                private apiService: ApiService) {
        this.database.ref('/balances').on('value', (snapshot) => {
            const local = this.getLocalAllBalance();
            const updated = snapshot.val() as AllBalance;
            console.log('load updated balances');
            if (JSON.stringify(local) !== JSON.stringify(updated)) {
                console.log('update local balances');
                this.onUpdateAllBalance(updated);
            }
        });
    }

    private getLocalAllBalance(): AllBalance {
        return JSON.parse(localStorage.getItem(this.ALL_BALANCE_KEY)) as AllBalance;
    }

    private saveLocalAllBalance(allBalances): void {
        localStorage.setItem(this.ALL_BALANCE_KEY, JSON.stringify(allBalances));
    }

    public async addNewNote(note: Note): Promise<void> {
        const allBalance = await this.apiService.post<AllBalance>('/notes/add', note);
        this.onUpdateAllBalance(allBalance);
    }

    public async updateNote(noteId: string, note: Note): Promise<void> {
        const allBalance = await this.apiService.post<AllBalance>(`/notes/update/${noteId}`, note);
        this.onUpdateAllBalance(allBalance);
    }

    public async updateBalance(meId: number, debtUserId: number, sum: number): Promise<UpdateBalanceResult> {
        return await this.apiService.post<UpdateBalanceResult>(
            '/balance/update',
            {ownerId: meId, debtUserId, sum});
    }

    public async mutualWriteOffBalance(meId: number, debtUserId: number, sum: number, forUserId: number): Promise<UpdateBalanceResult> {
        return await this.apiService.post<UpdateBalanceResult>(
            '/balance/mutual-write-off',
            {ownerId: meId, debtUserId, sum, forOwner: forUserId === meId});
    }

    private onUpdateAllBalance(updated: AllBalance) {
        this.onAllBalanceUpdate.next(updated);
        this.saveLocalAllBalance(updated);
        this.cacheService.evictAll();
    }
}

export interface UpdateBalanceResult {
    note: Note;
    noteId: string;
    ownerClosedNoteIds: string[];
    debtClosedNoteIds: string[];
}


