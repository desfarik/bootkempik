import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {AuthorizationService} from "../../service/authorization.service";
import {Balance} from "./balance";
import {User} from "../../service/model/user";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {

  constructor(private firebaseService: FirebaseService, private authService: AuthorizationService, private formBuilder: FormBuilder) {
  }

  @Input()
  public isActive: boolean;
  @Input()
  public balance: Balance;
  public totalBalance: number;
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

  public async ngOnInit(): Promise<void> {
    this.me = this.authService.getCurrentUser();
    this.allUsers = await this.firebaseService.userService.getAllUsers();
    this.viewUsers = this.allUsers.filter(user => user.id !== this.me.id).sort(this.selectedOrder);
    this.firebaseService.balanceService.onAllBalanceUpdate.subscribe(allBalance => {
      console.log('new', allBalance);
      if (allBalance) {
        this.balance = allBalance[this.me.id];
        this.totalBalance = Number(this.viewUsers.reduce?.((total: number, user: User) => total + this.getBalance(user.id), 0).toFixed?.(2));
      }
    });
  }


  public getPositiveBalance(userId: number): number {
    return (this.balance && this.balance.positive && this.balance.positive[userId]) || 0;
  }

  public getNegativeBalance(userId: number): number {
    return Math.abs((this.balance && this.balance.negative && this.balance.negative[userId]) || 0);
  }

  public getBalance(userId: number): number {
    return Number((this.getPositiveBalance(userId) - this.getNegativeBalance(userId)).toFixed(2));
  }

  public onChangeOrder(): void {
    this.viewUsers = this.viewUsers.sort(this.selectedOrder);
  }

}
