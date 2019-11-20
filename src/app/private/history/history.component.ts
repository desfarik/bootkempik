import {Component, OnInit} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {Note} from "../add-new-note/note";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  public notes: Note[];

  constructor(private firabeseService: FirebaseService) {
  }

  public async ngOnInit() {
    this.notes = await this.firabeseService.getAllNotes();
    console.log(this.notes);
  }

}
