import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {AuthorizationService} from "../../service/authorization.service";
import {Balance} from "./balance";
import {User} from "../../service/model/user";
import {FormBuilder} from "@angular/forms";
import {user} from "firebase-functions/lib/providers/auth";

@Component({
  selector: 'app-people-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnChanges {

  constructor(private firebaseService: FirebaseService, private authService: AuthorizationService, private formBuilder: FormBuilder) {
  }

  @Input()
  public isActive: boolean;
  @Input()
  public balance: Balance;
  @Input()
  public allUsers: User[];
  @Input()
  public me: User;
  public viewUsers: User[];

  public orderTypes = [
    {value: (a, b) => this.getBalance(b.id) - this.getBalance(a.id), viewValue: 'По убыванию'},
    {value: (a, b) => this.getBalance(a.id) - this.getBalance(b.id), viewValue: 'По возрастанию'},
  ];
  public selectedOrder = this.orderTypes[0].value;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.allUsers.firstChange) {
      return;
    }
    this.viewUsers = this.allUsers.filter(user => user.id !== this.me.id);
    this.onChangeOrder();
  }

  public getPositiveBalance(userId: string): number {
    return this.balance.positive[userId] || 0;
  }

  public getNegativeBalance(userId: string): number {
    return Math.abs(this.balance.negative[userId] || 0);
  }

  public getBalance(userId: string): number {
    return this.getPositiveBalance(userId) - this.getNegativeBalance(userId);
  }

  public openBalanceDetails(userId: string): void {
    console.log(userId);
  }

  public onChangeOrder(): void {
    this.viewUsers = this.viewUsers.sort(this.selectedOrder);
  }
}
