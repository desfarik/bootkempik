import {User} from "./model/user";
import firebase from "../../../node_modules/firebase";

export class UserService  {

  private allUsers: Map<number, User> = new Map();

  constructor(private database: firebase.database.Database, private functions: firebase.functions.Functions) {
    this.loadAllUsers();
  }

  public saveUser(newUser: User): Promise<void> {
    return this.database.ref(`users/${newUser.id}`).once('value')
      .then(async (snapshot) => {
        const user = snapshot.val();
        if (!user) {
          this.database.ref(`users/${newUser.id}`).set(newUser).then(() => {
              this.loadAllUsers();
            }
          );
        }
      });
  }

  private loadAllUsers(): Promise<void> {
    return this.getForceAllUsers().then((allUsers) => {
      allUsers.forEach(user => {
        this.allUsers.set(parseInt(user.id), user);
      })
    })
  }

  private getForceAllUsers(): Promise<User[]> {
    return this.database.ref('users').once('value')
      .then(snapshot => Object.values(snapshot.val()) as User[])
  }

  public async getAllUsers(): Promise<User[]> {
    if (this.allUsers.size === 0) {
      await this.loadAllUsers();
    }
    return Array.from(this.allUsers.values())
  }

  public async getUser(userId:string):Promise<User> {
    if (this.allUsers.size === 0) {
      await this.loadAllUsers();
    }
    return this.allUsers.get(parseInt(userId));
  }

  public getUserName(userId: string): string {
    const user = this.allUsers.get(parseInt(userId, 10));
    return user && user.first_name;
  }
}


