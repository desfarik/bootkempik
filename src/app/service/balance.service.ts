import firebase from "../../../node_modules/firebase/index";
import {AllBalance, Balance} from "../private/balance/balance";
import {BehaviorSubject} from "rxjs";
import {Note} from "../private/add-new-note/note";
import {CacheService} from "./cache.service";

export class BalanceService {

  private ALL_BALANCE_KEY = 'all_balance';
  public onAllBalanceUpdate = new BehaviorSubject<AllBalance>(this.getLocalAllBalance());

  constructor(private database: firebase.database.Database, cacheService: CacheService) {
    this.database.ref('/balances').on('value', (snapshot) => {
      const local = this.getLocalAllBalance();
      const updated = snapshot.val() as AllBalance;
      console.log('load updated balances');
      if (JSON.stringify(local) !== JSON.stringify(updated)) {
        console.log('update local balances');
        this.onAllBalanceUpdate.next(updated);
        this.saveLocalAllBalance(updated);
        cacheService.evictAll();
      }
    })
  }

  private getLocalAllBalance(): AllBalance {
    return JSON.parse(localStorage.getItem(this.ALL_BALANCE_KEY)) as AllBalance;
  }

  private saveLocalAllBalance(allBalances): void {
    localStorage.setItem(this.ALL_BALANCE_KEY, JSON.stringify(allBalances));
  }

  public async addNewNote(note: Note): Promise<void> {
    console.log('start add new Note');
    await this.database.ref('/notes').push(note);
    const allBalances = await this.getAllBalances();
    addNewNote(allBalances, note);
    console.log('start update all balances');
    await this.database.ref('/balances').set(allBalances);
    this.saveLocalAllBalance(allBalances);
  }

  public async closeNotes(notes: Note[], userId: number, total: number) {
    const allBalances = await this.getAllBalances();
    notes.forEach(note => {
      const ownerBalance = allBalances[note.ownerId];
      ownerBalance.positive[userId] = Number((ownerBalance.positive[userId] - total).toFixed(2));
      const userBalance = allBalances[userId];
      userBalance.negative[note.ownerId] = Number((userBalance.negative[note.ownerId] + total).toFixed(2));
    });
    console.log('start update all balances');
    await this.database.ref('/balances').set(allBalances);
    this.saveLocalAllBalance(allBalances);
  }

  public async getAllBalances(): Promise<AllBalance> {
    return (await this.database.ref('/balances').once('value')).val() as AllBalance || {};
  }

  public getBalance(userId): Promise<Balance> {
    return this.database.ref(`/balances/${userId}`).once('value').then(snapshot => {
      return snapshot.val() as Balance;
    })
  }

}

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function round(value) {
  return Number(value.toFixed(2));
}

const INIT_BALANCE: Balance = {positive: {}, negative: {}};

function addNewNote(allBalances: AllBalance, newNote: Note) {
  const ownerBalance = Object.assign({}, INIT_BALANCE, allBalances[newNote.ownerId]);
  newNote.moneyPerPerson.filter(moneyPerPerson => moneyPerPerson.personId !== newNote.ownerId)
    .forEach(moneyPerPerson => {
      ownerBalance.positive[moneyPerPerson.personId] = round((ownerBalance.positive[moneyPerPerson.personId] || 0) + moneyPerPerson.money);
      const personBalance = Object.assign({}, INIT_BALANCE, allBalances[moneyPerPerson.personId]);

      personBalance.negative[newNote.ownerId] = round((personBalance.negative[newNote.ownerId] || 0) - moneyPerPerson.money);
      allBalances[moneyPerPerson.personId] = personBalance;
      console.log(`update owner ${newNote.ownerId} and person ${moneyPerPerson.personId}`);
    });
  allBalances[newNote.ownerId] = ownerBalance;
  console.log(allBalances);
}


