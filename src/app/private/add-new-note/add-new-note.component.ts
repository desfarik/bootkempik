import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {User} from '../../service/model/user';
import {AuthorizationService} from '../../service/authorization.service';
import {FirebaseService} from '../../service/firebase.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {MoneyPerPerson, Note} from './note';
import {ActivatedRoute} from '@angular/router';
import {MoneySpreaderComponent} from "./money-spreader/money-spreader.component";

@Component({
    selector: 'app-add-new-note',
    templateUrl: './add-new-note.component.html',
    styleUrls: ['./add-new-note.component.scss']
})
export class AddNewNoteComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private fireBaseService: FirebaseService, private authService: AuthorizationService,
                private dialog: MatDialog, private route: ActivatedRoute, private changeDetector: ChangeDetectorRef) {
    }

    public addNewNoteForm: FormGroup;
    public allPersons: User[];
    public doublePersonCount = 0;
    public me: User;
    public loading = false;
    public maxDate: Date = new Date();
    public noteTypes = ['party', 'beer', 'pizza', 'food', 'gift', 'cinema'];
    public selectedType = this.noteTypes[0];
    public readonlyMode = false;
    public owner: User;

    @ViewChild(MoneySpreaderComponent)
    private moneySpreader: MoneySpreaderComponent;

    public async ngOnInit() {
        this.addNewNoteForm = this.formBuilder.group({
            title: [null, [Validators.required, Validators.maxLength(25)]],
            amount: [null, [Validators.required, Validators.max(999), Validators.min(1)]],
            description: [null, Validators.maxLength(96)],
            date: [new Date(), Validators.required],
            persons: [[], Validators.required]
        });
        this.me = this.authService.getCurrentUser();
        this.allPersons = await this.fireBaseService.userService.getAllUsers();

        this.route.data.subscribe(async data => {
            if (data.note) {
                this.readonlyMode = true;
                this.owner = await this.fireBaseService.userService.getUser(data.note.ownerId);
                this.addNewNoteForm.controls.title.setValue(data.note.title);

                this.addNewNoteForm.controls.amount.setValue(data.note.amount);

                this.addNewNoteForm.controls.description.setValue(data.note.description);

                this.addNewNoteForm.controls.date.setValue(new Date(data.note.date));

                this.moneySpreader.setMoneyPerPerson(this.allPersons, data.note.moneyPerPerson);
                this.addNewNoteForm.controls.persons.setValue(this.allPersons);
                this.selectedType = data.note.type;
                this.changeDetector.detectChanges();
            }
        });
    }

    public async submit() {
        if (this.addNewNoteForm.valid) {
            if (this.addNewNoteForm.value.persons.length === 1 && this.addNewNoteForm.value.persons[0].id === this.me.id) {
                this.dialog.open(ErrorDialog, {});
                return;
            }
            this.loading = true;
            const newNote = new Note(
                this.addNewNoteForm.value.date.getTime(),
                this.addNewNoteForm.value.amount,
                this.me.id,
                this.addNewNoteForm.value.description,
                this.moneySpreader.getMoneyPerPerson(),
                this.addNewNoteForm.value.title,
                this.selectedType);
            await this.fireBaseService.balanceService.addNewNote(newNote);
            this.loading = false;
            this.moveToMainPage();
        }
    }

    public moveToMainPage() {
        history.back();
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

@Component({
    selector: 'error-dialog',
    templateUrl: './dialog/error/drinking-error.html',
})
export class ErrorDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
}
