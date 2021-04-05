import {User} from './model/user';
import firebase from '../../../node_modules/firebase';
import {ApiService} from './api.service';

export class UserService {

    private allUsers: Map<number, User> = new Map();

    constructor(private database: firebase.database.Database,
                private apiService: ApiService) {
        this.loadAllUsers();
    }

    public saveUser(newUser: User): Promise<void> {
        return this.apiService.post('/user/save', newUser)
            .then((result: SaveUserResult) => {
                if (result.created) {
                    this.allUsers.set(newUser.id, newUser);
                }
            });
    }

    private loadAllUsers(): Promise<void> {
        return this.getForceAllUsers().then((allUsers) => {
            allUsers.forEach(user => {
                this.allUsers.set(user.id, user);
            });
        });
    }

    private getForceAllUsers(): Promise<User[]> {
        return this.database.ref('users').once('value')
            .then(snapshot => Object.values(snapshot.val()) as User[]);
    }

    public async getAllUsers(): Promise<User[]> {
        if (this.allUsers.size === 0) {
            await this.loadAllUsers();
        }
        return copy(Array.from(this.allUsers.values()));
    }

    public async getUser(userId: string | number): Promise<User> {
        if (this.allUsers.size === 0) {
            await this.loadAllUsers();
        }
        return copy(this.allUsers.get(Number(userId)));
    }
}

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

interface SaveUserResult {
    created: boolean;
}


