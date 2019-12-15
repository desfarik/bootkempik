import {Injectable} from "@angular/core";
import {firebase} from '@firebase/app';
import '@firebase/database';
import '@firebase/functions'
import {UserService} from "./user.service";
import {firebaseConfig} from "../../../firebase.config";
import {Note} from "../private/add-new-note/note";
import {BalanceService} from "./balance/balance.service";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public userService: UserService;
  public balanceService: BalanceService;
  private functions: any;
  private database: any;

  constructor() {
   const app= firebase.initializeApp(firebaseConfig);
    this.database = firebase.database(app);
    this.functions = firebase.functions(app);
    this.userService = new UserService(this.database, this.functions);
    this.balanceService = new BalanceService(this.database, this.functions);
  }

  public getAllNotes(): Promise<Note[]> {
    return this.database.ref('/notes').once('value').then(snapshot => {
      return (Object.values(snapshot.val()) as Note[])
    })
  }
}
