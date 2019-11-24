import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {User} from "../../service/model/user";
import {AuthorizationService} from "../../service/authorization.service";
import {FirebaseService} from "../../service/firebase.service";
import {MatDialog} from "@angular/material";
import {SelectParticipantsDialog} from "./select-participants/select-participants-dialog.component";
import {MoneyPerPerson, Note} from "./note";
import {Router} from "@angular/router";

@Component({
  selector: 'app-add-new-note',
  templateUrl: './add-new-note.component.html',
  styleUrls: ['./add-new-note.component.scss']
})
export class AddNewNoteComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private fireBaseService: FirebaseService, private authService: AuthorizationService,
              private dialog: MatDialog, private router: Router) {
  }

  public addNewNoteForm: FormGroup;
  public allPersons: User[];
  public doublePersonCount: number = 0;
  public me: User;

  public async ngOnInit() {
    this.addNewNoteForm = this.formBuilder.group({
      'amount': [null, [Validators.required, Validators.max(999), Validators.min(1)]],
      'description': [null, Validators.required],
      'date': [new Date(), Validators.required],
      'persons': [[], Validators.required],
    });
    this.me = this.authService.getCurrentUser();
    this.allPersons = (await this.fireBaseService.userService.getAllUsers()).filter(person => person.id !== this.me.id);
  }

  public remove(person) {
    const persons = this.addNewNoteForm.controls.persons.value;
    persons.splice(persons.indexOf(person), 1);
    this.addNewNoteForm.controls.persons.setValue(persons);
  }

  public toggleDoubleRate(person) {
    person.double = !person.double;
    if (person.double) {
      this.doublePersonCount++;
    } else {
      this.doublePersonCount--;
    }
  }

  public openDialog() {
    this.dialog.open(SelectParticipantsDialog, {
      width: "80%",
      autoFocus: false,
      data: {
        persons: [...this.allPersons, this.me].filter(person => this.addNewNoteForm.controls.persons.value.indexOf(person) === -1)
      }
    }).afterClosed().subscribe(result => {
      if (!result || result.length < 1) {
        return
      }
      const persons = this.addNewNoteForm.controls.persons.value;
      persons.push(...result);
      this.addNewNoteForm.controls.persons.setValue(persons);
    })
    ;
  }

  public submit() {
    if (this.addNewNoteForm.valid) {
      const newNote = new Note(this.addNewNoteForm.value.date.getTime(), this.addNewNoteForm.value.amount, this.me, this.addNewNoteForm.value.description, this.getMoneyPerPerson());
      this.fireBaseService.balanceService.addNewNote(newNote);
      this.moveToMainPage();
    }
  }

  public moveToMainPage() {
    history.back();
  }

  private getMoneyPerPerson(): MoneyPerPerson[] {
    const moneyPerPerson = Number(this.addNewNoteForm.value.amount) / (this.addNewNoteForm.value.persons.length + this.doublePersonCount);
    return this.addNewNoteForm.value.persons.map(person => {
      let money = moneyPerPerson;
      if (person.double) {
        money += money;
      }
      return {
        personId: person.id,
        money: Number(money.toFixed(2))
      }
    })
  }
}
