import {Pipe, PipeTransform} from '@angular/core';
import {MoneyPerPerson} from "../../add-new-note/note";

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {

  transform(moneyPerPerson: MoneyPerPerson[], userId: number): any {
    return moneyPerPerson.find(e => e.personId === userId).money;
  }

}
