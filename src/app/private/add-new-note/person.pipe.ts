import {Pipe, PipeTransform} from '@angular/core';
import {User} from "../../service/model/user";
import {AuthorizationService} from "../../service/authorization.service";

@Pipe({
  name: 'person'
})
export class PersonPipe implements PipeTransform {
  public meId: number;

  constructor(private authService: AuthorizationService) {
    this.meId = parseInt(authService.getUserId());
  }

  transform(value: User, me?: User): any {
    if (parseInt(value && value.id) === this.meId) {
      return 'Я';
    }
    return value && value.first_name;
    // return value.first_name + " " + value.last_name;
  }

}
