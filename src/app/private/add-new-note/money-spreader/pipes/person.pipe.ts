import {Pipe, PipeTransform} from '@angular/core';
import {User} from "../../../../service/model/user";
import {AuthorizationService} from "../../../../service/authorization.service";

@Pipe({
  name: 'person'
})
export class PersonPipe implements PipeTransform {
  public meId: number;

  constructor(private authService: AuthorizationService) {
    this.meId = authService.getUserId();
  }

  transform(value: User, changeMe: boolean = true): any {
    return value && (value.first_name + ' ' + value.last_name);
  }

}
