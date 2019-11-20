import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'moneyPerPerson'
})
export class MoneyPerPersonPipe implements PipeTransform {

  transform(amount: string, personCount: number, person: any, doublePersonCount): any {
    if (amount) {
      const perPerson = (Number(amount) / (personCount + doublePersonCount));
      if (person.double) {
        return (perPerson * 2).toFixed(2);
      }
      return perPerson.toFixed(2);
    } else {
      return ''
    }
  }

}
