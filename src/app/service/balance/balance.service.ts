import {User} from '../model/user';
import firebase from '../../../../node_modules/firebase/index';
import {AllBalance, Balance} from '../../private/balance/balance';
import {BehaviorSubject} from 'rxjs';
import {Note} from '../../private/add-new-note/note';
import {processBalances} from './process-balances';
import {OfflineDatabase} from '../firebase.service';

export class BalanceService {

    private allBalance: AllBalance;
    public onAllBalanceUpdate = new BehaviorSubject<AllBalance>(null);
    public onUserBalanceUpdate = new BehaviorSubject<AllBalance>(null);
    private sendAllBalanceUpdate = false;
    private sendUserBalanceUpdate = false;

    constructor(private database: firebase.database.Database, private functions: firebase.functions.Functions,
                private offlineDatabase: OfflineDatabase) {
        this.offlineDatabase.getAllBalances().then(balances => {
            this.allBalance = balances;
            if (this.sendUserBalanceUpdate) {
                this.onUserBalanceUpdate.next(this.allBalance);
            }
            if (this.sendAllBalanceUpdate) {
                this.onAllBalanceUpdate.next(this.allBalance);
            }
        });
    }

    public async reduceBalance(currentUserId: string, userId: string, value: number): Promise<void> {
        await this.loadAllBalances();
        this.allBalance.lastUpdateDate = new Date().getTime();
        this.allBalance[currentUserId].positive[userId] = Number((this.allBalance[currentUserId].positive[userId] - value).toFixed(2));
        this.allBalance[userId].negative[currentUserId] = Number((this.allBalance[userId].negative[currentUserId] + value).toFixed(2));
        this.offlineDatabase.loadAllBalances(this.allBalance);
        this.database.ref('/balances').set(this.allBalance);
        this.onAllBalanceUpdate.next(this.allBalance);
        this.onUserBalanceUpdate.next(this.allBalance);
    }

    public async commonReduce(userId): Promise<Map<string, number>> {
        await this.loadAllBalances();
        const userBalance = this.allBalance[userId];
        const map = new Map();
        Object.keys(userBalance.negative).forEach((negativeKey) => {
            if (userBalance.positive[negativeKey] && Math.abs(userBalance.negative[negativeKey])) {
                map.set(negativeKey, Math.min(userBalance.positive[negativeKey], Math.abs(userBalance.negative[negativeKey])));
            }
        });
        if (map.size === 0) {
            return;
        }
        map.forEach((value, key) => {
            this.allBalance[userId].positive[key] = Number((this.allBalance[userId].positive[key] - value).toFixed(2));
            this.allBalance[userId].negative[key] = Number((this.allBalance[userId].negative[key] + value).toFixed(2));

            this.allBalance[key].positive[userId] = Number((this.allBalance[key].positive[userId] - value).toFixed(2));
            this.allBalance[key].negative[userId] = Number((this.allBalance[key].negative[userId] + value).toFixed(2));
        });
        this.allBalance.lastUpdateDate = new Date().getTime();
        this.offlineDatabase.loadAllBalances(this.allBalance);
        this.database.ref('/balances').set(this.allBalance);
        this.onAllBalanceUpdate.next(this.allBalance);
        this.onUserBalanceUpdate.next(this.allBalance);
        return map;
    }


    public addNewNote(note: Note): void {
        processBalances(this.allBalance, note);
        this.onAllBalanceUpdate.next(this.allBalance);
        this.functions.httpsCallable('addNewNotes')(note);
        this.offlineDatabase.loadAllBalances(this.allBalance);
    }

    public getAllBalances(): AllBalance {
        setTimeout(() => this.loadAllBalances(this.onAllBalanceUpdate), 2000);
        this.sendAllBalanceUpdate = !this.allBalance;
        return this.allBalance;
    }

    public getUserBalance(user: User): Balance {
        setTimeout(() => this.loadAllBalances(this.onUserBalanceUpdate), 2000);
        this.sendUserBalanceUpdate = !this.allBalance;
        return this.allBalance && this.allBalance[user.id];
    }

    private loadAllBalances(subject?: BehaviorSubject<AllBalance>): Promise<AllBalance> {
        return this.database.ref('/balances').once('value').then(snapshot => {
            const balances = snapshot.val() as AllBalance;
            if (balances.lastUpdateDate > ((this.allBalance && this.allBalance.lastUpdateDate) || 0)) {
                this.offlineDatabase.loadAllBalances(balances);
                if (!!subject) {
                    subject.next(balances);
                }
                return balances;
            } else {
                return this.allBalance;
            }
        });
    }
}



