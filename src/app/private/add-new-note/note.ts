export class Note {
    public nowDate: number;
    public imageUrl: string;

    constructor(public date: number, public amount: number,
                public ownerId: number,
                public description: string,
                public moneyPerPerson: MoneyPerPerson,
                public title: string,
                public type: string,
                private imageBase64: string) {
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
