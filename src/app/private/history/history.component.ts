import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {Note} from "../add-new-note/note";
import {User} from "../../service/model/user";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnChanges {

  @Input()
  public isActive: boolean;
  public notes: Note[];
  public loading = true;


  public orderTypes = [
    {value: (a, b) => b.date - a.date, viewValue: 'Сначала новые'},
    {value: (a, b) => a.date - b.date, viewValue: 'Сначала старые'},
  ];
  public selectedOrder = this.orderTypes[0].value;
  public allUsers: Map<number, User> = new Map();

  constructor(private firebaseService: FirebaseService) {
  }

  public async ngOnInit() {
    this.loading = true;
    (await this.firebaseService.userService.getAllUsers()).forEach(user => {
      this.allUsers.set(parseInt(user.id), user);
    });
    this.notes = (await this.firebaseService.getAllNotes()).sort(this.selectedOrder);
    this.notes.splice(-1, 1);
    this.loading = false;
    console.log(this.notes);
  }

  public onChangeOrder() {
    this.notes = this.notes.sort(this.selectedOrder);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.isActive) {
      this.loading = true;
      this.notes = (await this.firebaseService.getAllNotes()).sort(this.selectedOrder);
      this.notes.splice(-1, 1);
      this.loading = false;
    }
  }

}
