import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Route, Router} from "@angular/router";
import {Note} from "../add-new-note/note";
import {User} from "../../service/model/user";
import {FirebaseService} from "../../service/firebase.service";
import {AuthorizationService} from "../../service/authorization.service";
import {CacheService} from "../../service/cache.service";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material";

@Component({
  selector: 'app-user-notes',
  templateUrl: './user-notes.component.html',
  styleUrls: ['./user-notes.component.scss']
})
export class UserNotesComponent implements OnInit {

  constructor(private route: ActivatedRoute, private firebaseService: FirebaseService, private authorizationService: AuthorizationService,
              private router: Router, private cacheService: CacheService, public dialog: MatDialog) {
  }

  public notes: SelectedNote[] = [];
  public user: User;
  public me: User;
  public mode: string = "VIEW";
  public loading: boolean = false;

  ngOnInit(): void {
    this.me = this.authorizationService.getCurrentUser();
    this.route.queryParams.subscribe(async (params) => {
      this.user = await this.firebaseService.userService.getUser(params.userId);
      this.route.data.subscribe(data => {
        this.sortNotes(data.userNotes as SelectedNote[]);
      });
    });
  }

  private sortNotes(userNotes: Note[]) {
    const closedNotes = [];
    const openedNotes = [];
    userNotes.sort((a, b) => b.date - a.date)
      .forEach(note => {
        if (this.isClosedNote(note)) {
          closedNotes.push(note);
        } else {
          openedNotes.push(note);
        }
      });
    this.notes = [...openedNotes, ...closedNotes];
  }

  public isClosedNote(note: Note): boolean {
    if (note.ownerId === this.me.id) {
      return !note.openFor?.includes(this.user.id)
    } else {
      return !note.openFor?.includes(this.me.id)
    }
  }

  public openNoteView(note: SelectedNote) {
    if (this.mode === "VIEW") {
      this.cacheService.setValue(note.nowDate.toString(), note);
      this.router.navigate(['/add-new-note'], {queryParams: {noteId: note.nowDate}});
    } else {
      note.selected = !note.selected;
    }
  }

  public changeModeToEdit(note: SelectedNote) {
    if (note.ownerId === this.me.id && !this.isClosedNote(note)) {
      this.mode = "EDIT";
      note.selected = true;
    }
  }

  public getTotalSum(): number {
    const total = this.notes.reduce((result, note) => {
      if (note.selected) {
        return result + note.moneyPerPerson.find(e => e.personId === this.user.id).money;
      } else {
        return result
      }
    }, 0);
    return Number(total.toFixed(2));
  }

  public changeModeToView() {
    this.mode = "VIEW";
    this.notes.forEach(note => note.selected = false);
  }

  public onLongPressing() {
    console.log('1');
  }

  public moveToMainPage() {
    history.back();
  }

  public openConfirmDialog() {
    const total = this.getTotalSum();
    this.dialog.open(ConfirmDialog, {
      data: {
        amount: total,
        person: this.user
      }
    }).afterClosed().subscribe(async result => {
      if (result) {
        this.loading = true;
        const updatedNotes = [];
        this.notes.forEach(note => {
          if (note.selected) {
            updatedNotes.push(note);
            note.openFor?.splice(note.openFor.findIndex((userId) => userId === this.user.id), 1);
          }
        });
        updatedNotes.forEach(note => note.selected = false);
        await this.firebaseService.updateNotes(updatedNotes);
        await this.firebaseService.balanceService.updateBalance(this.me.id, this.user.id, total);
        this.changeModeToView();
        this.sortNotes(this.notes);
        this.loading = false;
      }
      console.log(result);
    })
  }

}

export interface SelectedNote extends Note {
  selected: boolean;
}

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm.dialog.html',
})
export class ConfirmDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
