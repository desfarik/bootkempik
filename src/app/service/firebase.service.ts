import {Injectable} from '@angular/core';
import { firebase } from '@firebase/app';
import {UserService} from './user.service';
import {firebaseConfig} from '../../../firebase.config';
import '@firebase/database';
import '@firebase/functions';
import {Note} from '../private/add-new-note/note';
import {HistoryService} from './history.service';
import {BalanceService} from './balance/balance.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public userService: UserService;
  public historyService: HistoryService;
  public balanceService: BalanceService;
  private functions: firebase.functions.Functions;
  private database: firebase.database.Database;

  constructor() {
    firebase.initializeApp(firebaseConfig);
    // @ts-ignore
    this.database = firebase.database();
    this.functions = firebase.functions();
    this.userService = new UserService(this.database, this.functions);
    this.historyService = new HistoryService(this.database, this.functions);
    this.balanceService = new BalanceService(this.database, this.functions);
  }

  public getAllNotes(): Promise<Note[]> {
    return this.database.ref('/notes').once('value').then(snapshot => {
      return (Object.values(snapshot.val()) as Note[])
    })
  }
}
