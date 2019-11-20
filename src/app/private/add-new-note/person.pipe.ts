import {Pipe, PipeTransform} from '@angular/core';
import {User} from "../../service/model/user";
import {AuthorizationService} from "../../service/authorization.service";

@Pipe({
  name: 'person'
})
export class PersonPipe implements PipeTransform {
  public me: User;

  constructor(private authService: AuthorizationService) {
    this.me = authService.getCurrentUser();
  }

  transform(value: User, me: User): any {
    if (value.id === this.me.id) {
      return 'Я';
    }
    return value.first_name;
    // return value.first_name + " " + value.last_name;
  }

}
