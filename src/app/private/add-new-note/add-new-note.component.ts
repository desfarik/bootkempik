import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {User} from "../../service/model/user";
import {AuthorizationService} from "../../service/authorization.service";
import {FirebaseService} from "../../service/firebase.service";
import {MatDialog} from "@angular/material";
import {SelectParticipantsDialog} from "./select-participants/select-participants-dialog.component";
import {MoneyPerPerson, Note} from "./note";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-add-new-note',
  templateUrl: './add-new-note.component.html',
  styleUrls: ['./add-new-note.component.scss']
})
export class AddNewNoteComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private fireBaseService: FirebaseService, private authService: AuthorizationService,
              private dialog: MatDialog, private route: ActivatedRoute) {
  }

  public addNewNoteForm: FormGroup;
  public allPersons: User[];
  public doublePersonCount: number = 0;
  public me: User;
  public loading: boolean = false;
  public maxDate: Date = new Date();
  public noteTypes = ["party", "beer", "pizza", "food", "gift", "cinema"];
  public selectedType = this.noteTypes[0];
  public readonlyMode = false;
  public owner: User;

  public async ngOnInit() {
    this.addNewNoteForm = this.formBuilder.group({
      'title': [null, [Validators.required, Validators.maxLength(25)]],
      'amount': [null, [Validators.required, Validators.max(999), Validators.min(1)]],
      'description': [null],
      'date': [new Date(), Validators.required],
      'persons': [[], Validators.required]
    });
    this.me = this.authService.getCurrentUser();
    this.allPersons = (await this.fireBaseService.userService.getAllUsers()).filter(person => person.id !== this.me.id);

    this.route.data.subscribe(async data => {
      if (data.note) {
        this.readonlyMode = true;
        this.owner = await this.fireBaseService.userService.getUser(data.note.ownerId);
        this.addNewNoteForm.controls.title.setValue(data.note.title);
        // this.addNewNoteForm.controls.title.disable();

        this.addNewNoteForm.controls.amount.setValue(data.note.amount);
        // this.addNewNoteForm.controls.amount.disable();

        this.addNewNoteForm.controls.description.setValue(data.note.description);
        // this.addNewNoteForm.controls.description.disable();

        this.addNewNoteForm.controls.date.setValue(new Date(data.note.date));
        // this.addNewNoteForm.controls.date.disable();

        this.addNewNoteForm.controls.persons.setValue(this.prepareMoneyPerPerson(data.note.amount, data.note.moneyPerPerson));
        // this.addNewNoteForm.controls.persons.disable();
        this.selectedType = data.note.type;
      }
    });

  }

  public remove(person) {
    if (!!person.double) {
      this.doublePersonCount--;
      person.double = false;
    }
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

  public async submit() {
    if (this.addNewNoteForm.valid) {
      this.loading = true;
      const newNote = new Note(this.addNewNoteForm.value.date.getTime(), this.addNewNoteForm.value.amount, this.me.id, this.addNewNoteForm.value.description, this.getMoneyPerPerson(),
        this.addNewNoteForm.value.title, this.selectedType);
      await this.fireBaseService.balanceService.addNewNote(newNote);
      this.loading = false;
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

  private prepareMoneyPerPerson(amount: number, moneyPerPersons: MoneyPerPerson[]): User[] {
    const result = [];
    const moneyPerPerson = Number((amount / moneyPerPersons.length).toFixed(2));
    moneyPerPersons.forEach(e => {
      result.push(this.allPersons.find(person => person.id === e.personId) || this.me);
      if (e.money > moneyPerPerson) {
        result[result.length - 1].double = true;
        this.doublePersonCount++;
      }
    });
    return result;
  }
}
