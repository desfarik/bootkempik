import {User} from "../model/user";
import firebase from "../../../../node_modules/firebase/index";
import {AllBalance, Balance} from "../../private/balance/balance";
import {BehaviorSubject} from "rxjs";
import Dexie from "dexie";
import {Note} from "../../private/add-new-note/note";
import {processBalances} from "./process-balances";

export class BalanceService {

  private allBalance: AllBalance;
  public onAllBalanceUpdate = new BehaviorSubject<AllBalance>(null);
  public onUserBalanceUpdate = new BehaviorSubject<AllBalance>(null);
  private balanceDb = new BalanceDatabase();
  private sendAllBalanceUpdate = false;
  private sendUserBalanceUpdate = false;

  constructor(private database: firebase.database.Database, private functions: firebase.functions.Functions) {
    this.balanceDb.getAll().then(balances => {
      this.allBalance = balances;
      if (this.sendUserBalanceUpdate) {
        this.onUserBalanceUpdate.next(this.allBalance);
      }
      if (this.sendAllBalanceUpdate) {
        this.onAllBalanceUpdate.next(this.allBalance);
      }
    });
  }

  public addNewNote(note: Note): void {
    processBalances(this.allBalance, note);
    this.onAllBalanceUpdate.next(this.allBalance);
    this.functions.httpsCallable('addNewNotes')(note);
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
      if (balances.lastUpdateDate > (this.allBalance.lastUpdateDate || 0)) {
        this.balanceDb.loadAllBalances(balances);
        if (!!subject) {
          subject.next(balances);
        }
        return balances;
      } else {
        return this.allBalance;
      }
    })
  }
}

class BalanceDatabase extends Dexie {
  public balances: Dexie.Table<Balance, string>;

  public constructor() {
    super("BalanceDatabase");
    this.version(1).stores({
      balance: ""
    });
    this.balances = this.table("balance");
  }

  public loadAllBalances(balances: AllBalance) {
    this.balances.bulkPut(Object.values(balances), Object.keys(balances) as any);
  }

  public async getAll(): Promise<AllBalance> {
    const allBalance = {};
    await this.balances.each((balance, cursor) => {
      // @ts-ignore
      allBalance[cursor.key] = balance;
    });
    return allBalance as AllBalance;
  }
}


