import {User} from '../../service/model/user';

export class Note {
    public nowDate: number;

    constructor(public date: number, public amount: number, public owner: User, public description: string,
                public moneyPerPerson: MoneyPerPerson[], public positive = false) {
        this.nowDate = new Date().getTime();
    }

}

export interface MoneyPerPerson {
    money: number;
    personId: number;
}

export interface AllNotes {
    // @ts-ignore
    lastUpdateDate: number;

    [id: string]: Note;
}
