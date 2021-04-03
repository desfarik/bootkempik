export class Note {
    public nowDate: number;
    public openFor: number[];

    constructor(public date: number, public amount: number,
                public ownerId: number,
                public description: string,
                public moneyPerPerson: MoneyPerPerson[],
                public title: string,
                public type: string) {
        this.nowDate = new Date().getTime();
        this.openFor = this.moneyPerPerson.filter(person => person.personId !== ownerId).map(person => person.personId);
    }

}

export interface MoneyPerPerson {
    money: number;
    personId: number;
    manual?: boolean;
    double?: boolean;
}

export interface AllNotes {
    // @ts-ignore
    lastUpdateDate: number;

    [id: string]: Note;
}
