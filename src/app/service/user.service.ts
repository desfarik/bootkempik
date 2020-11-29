import {User} from "./model/user";
import firebase from "../../../node_modules/firebase";

export class UserService {

  private allUsers: Map<number, User> = new Map();

  constructor(private database: firebase.database.Database) {
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
        this.allUsers.set(user.id, user);
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
    return copy(Array.from(this.allUsers.values()));
  }

  public async getUser(userId: string): Promise<User> {
    if (this.allUsers.size === 0) {
      await this.loadAllUsers();
    }
    return copy(this.allUsers.get(parseInt(userId)));
  }

  public getForceUser(userId: string): User {
    return this.allUsers.get(parseInt(userId));
  }

  public async getUserByName(userName: string): Promise<User> {
    if (this.allUsers.size === 0) {
      await this.loadAllUsers();
    }
    // @ts-ignore
    return Array.from(this.allUsers.values()).find((user: User) => user.first_name === userName);
  }

  public getUserName(userId: string): string {
    const user = this.allUsers.get(parseInt(userId, 10));
    return user && user.first_name;
  }
}

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}


