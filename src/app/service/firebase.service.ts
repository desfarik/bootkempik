import {Injectable} from "@angular/core";
import * as firebase from 'firebase';
import {UserService} from "./user.service";
import {firebaseConfig} from "../../../firebase.config";
import {Note} from "../private/add-new-note/note";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public userService: UserService;
  private functions: firebase.functions.Functions;
  private database: firebase.database.Database;

  constructor() {
    firebase.initializeApp(firebaseConfig);
    this.database = firebase.database();
    this.functions = firebase.functions();
    this.userService = new UserService(this.database, this.functions);
  }

  public addNewNote(note: Note): void {
    this.functions.httpsCallable('addNewNotes')(note);
  }

  public getAllNotes(): Promise<Note[]> {
    return this.database.ref('/notes').once('value').then(snapshot => {
      return (Object.values(snapshot.val()) as Note[])
    })
  }
}
