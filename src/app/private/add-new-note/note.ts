import {NoteType} from "../user-notes/note.enum";

export class Note {
    public nowDate: number;

    constructor(public date: number, public amount: number,
                public ownerId: number,
                public description: string,
                public moneyPerPerson: MoneyPerPerson,
                public title: string,
                public type: NoteType,
                private imageBase64: string,
                public imageUrl?: string) {
        this.nowDate = new Date().getTime();
    }
}

export interface MoneyPerPerson {
    [key: number]: {
        money: number;
        paid: boolean;
        manual?: boolean;
        double?: boolean;
    };
}

export interface AllNotes {
    [key: string]: Note;
}
