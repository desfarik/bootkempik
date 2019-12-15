import firebase from "../../../../node_modules/firebase/index";
import {AllBalance, Balance} from "../../private/balance/balance";
import {BehaviorSubject} from "rxjs";
import Dexie from "dexie";
import {Note} from "../../private/add-new-note/note";
import {User} from "../model/user";

export class BalanceService {

  private allBalance: AllBalance;
  public onAllBalanceUpdate = new BehaviorSubject<AllBalance>(null);
  private balanceDb = new BalanceDatabase();
  private sendAllBalanceUpdate = false;

  constructor(private database: firebase.database.Database, private functions: firebase.functions.Functions) {
    this.balanceDb.getAll().then(balances => {
      this.allBalance = balances;
      if (this.sendAllBalanceUpdate) {
        this.onAllBalanceUpdate.next(this.allBalance);
      }
    });
  }

  public async addNewNote(note: Note): Promise<void> {
    this.allBalance = (await this.functions.httpsCallable('addNewNotes')(note)).data as AllBalance;
    console.log(this.allBalance);
    this.balanceDb.loadAllBalances(this.allBalance);
    this.onAllBalanceUpdate.next(this.allBalance);
  }

  public async reduceCredit(value: number, user: User, toUser: User) {
    this.allBalance = (await this.functions.httpsCallable('reduceCredit')([value, user, toUser.id])).data as AllBalance;
    console.log(this.allBalance);
    this.balanceDb.loadAllBalances(this.allBalance);
    this.onAllBalanceUpdate.next(this.allBalance);
  }
  public async mutualReduceCredit(user:User) {
    this.allBalance = (await this.functions.httpsCallable('mutualReduceCredit')(user)).data as AllBalance;
    console.log(this.allBalance);
    this.balanceDb.loadAllBalances(this.allBalance);
    this.onAllBalanceUpdate.next(this.allBalance);
  }

  public getAllBalances(): AllBalance {
    this.loadAllBalances(this.onAllBalanceUpdate);
    this.sendAllBalanceUpdate = !this.allBalance;
    return this.allBalance;
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


