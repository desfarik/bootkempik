import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../service/model/user';
import {AuthorizationService} from '../../service/authorization.service';
import {FirebaseService} from '../../service/firebase.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {Note} from './note';
import {ActivatedRoute, Router} from '@angular/router';
import {MoneySpreaderComponent} from './money-spreader/money-spreader.component';
import {isAutoNote} from '../user-notes/note.enum';
import {StatusAppService} from '../../service/status-app.service';
import {PhotoUploaderComponent} from "./photo-uploader/photo-uploader.component";

@Component({
    selector: 'app-add-new-note',
    templateUrl: './add-new-note.component.html',
    styleUrls: ['./add-new-note.component.scss']
})
export class AddNewNoteComponent implements OnInit {

    constructor(private formBuilder: FormBuilder,
                private fireBaseService: FirebaseService,
                private authService: AuthorizationService,
                private dialog: MatDialog,
                private route: ActivatedRoute,
                private router: Router,
                private changeDetector: ChangeDetectorRef,
                public statusAppService: StatusAppService) {
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
    public isEditableNote = false;
    public owner: User;
    public imageUrl: string;

    @ViewChild(MoneySpreaderComponent)
    private moneySpreader: MoneySpreaderComponent;
    @ViewChild(PhotoUploaderComponent)
    private photoUploader: PhotoUploaderComponent;

    public async ngOnInit() {
        this.addNewNoteForm = this.formBuilder.group({
            title: [null, [Validators.required, Validators.maxLength(25)]],
            amount: [null, [Validators.required, Validators.max(999), Validators.min(1)]],
            description: [null, Validators.maxLength(200)],
            date: [new Date(), Validators.required],
            persons: [[], Validators.required]
        });
        this.me = this.authService.getCurrentUser();
        this.allPersons = await this.fireBaseService.userService.getAllUsers();

        this.route.data.subscribe(async data => {
            if (data.note) {
                const note: Note = data.note;
                this.readonlyMode = true;
                this.owner = await this.fireBaseService.userService.getUser(note.ownerId);
                this.addNewNoteForm.controls.title.setValue(note.title);

                this.addNewNoteForm.controls.amount.setValue(note.amount);

                this.addNewNoteForm.controls.description.setValue(note.description);

                this.addNewNoteForm.controls.date.setValue(new Date(note.date));

                this.moneySpreader.setMoneyPerPerson(this.allPersons, note.moneyPerPerson);
                this.addNewNoteForm.controls.persons.setValue(this.allPersons);
                this.selectedType = note.type;
                this.isEditableNote = !isAutoNote(note) && !this.isAnyPaid(note) && note.ownerId === this.me.id;
                this.imageUrl = note.imageUrl;
                this.addNewNoteForm.disable();
                this.changeDetector.detectChanges();
            }
        });
    }

    private isAnyPaid(note: Note): boolean {
        return !!Object.entries(note.moneyPerPerson).find(([userId, moneyPerPerson]) => {
            if (Number(userId) === this.owner.id) {
                return false;
            }
            return moneyPerPerson.paid;
        });
    }

    public changeModeToEdit() {
        this.readonlyMode = false;
        this.addNewNoteForm.enable();
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
                this.selectedType,
                await this.photoUploader.getImageBase64(),
                this.photoUploader.initialUrl);
            try {
                if (this.isEditableNote) {
                    await this.fireBaseService.balanceService.updateNote(this.route.snapshot.queryParams.noteId, newNote);
                } else {
                    await this.fireBaseService.balanceService.addNewNote(newNote);
                }
                this.moveToMainPage();
            } finally {
                this.loading = false;
            }

        }
    }

    public moveToMainPage() {
        const from = this.route.snapshot.queryParams.from;
        if (from) {
            this.router.navigateByUrl(from);
        } else {
            this.router.navigateByUrl('');
        }
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
