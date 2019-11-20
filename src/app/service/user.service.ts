import {User} from "./model/user";
import firebase from "../../../node_modules/firebase";
import {BaseFunctionsService} from "./base-functions.service";

export class UserService extends BaseFunctionsService {
  constructor(private database: firebase.database.Database, protected functions: firebase.functions.Functions) {
    super(functions);
  }

  public saveUser(newUser: User): Promise<void> {
   return this.database.ref(`users/${newUser.id}`).once('value')
      .then(async (snapshot) => {
        const user = snapshot.val();
        if (!user) {
          await this.database.ref(`users/${newUser.id}`).set(newUser);
        }
      });
  }

  public getAllUsers(): Promise<User[]> {
    return this.database.ref('users').once('value')
      .then(snapshot => Object.values(snapshot.val()) as User[])
  }

}
