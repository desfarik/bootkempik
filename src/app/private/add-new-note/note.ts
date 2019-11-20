import {User} from "../../service/model/user";

export class Note {
  constructor(public date: Date,public amount: number, public owner: User, public description: string, public moneyPerPerson: MoneyPerPerson[]) {
  }

}

export interface MoneyPerPerson {
  money: number;
  personId: number;
}
