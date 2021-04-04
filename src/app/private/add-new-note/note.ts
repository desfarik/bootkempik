export class Note {
    public nowDate: number;

    constructor(public date: number, public amount: number,
                public ownerId: number,
                public description: string,
                public moneyPerPerson: MoneyPerPerson,
                public title: string,
                public type: string) {
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
    // @ts-ignore
    lastUpdateDate: number;

    [id: string]: Note;
}
