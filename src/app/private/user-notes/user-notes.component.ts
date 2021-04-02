import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Note} from '../add-new-note/note';
import {User} from '../../service/model/user';
import {FirebaseService} from '../../service/firebase.service';
import {AuthorizationService} from '../../service/authorization.service';
import {CacheService} from '../../service/cache.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {filter, map} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-user-notes',
    templateUrl: './user-notes.component.html',
    styleUrls: ['./user-notes.component.scss'],
})
export class UserNotesComponent implements OnInit {

    constructor(private route: ActivatedRoute,
                private firebaseService: FirebaseService,
                private authorizationService: AuthorizationService,
                private router: Router,
                private cacheService: CacheService,
                public dialog: MatDialog) {
    }

    public notes: Note[] = [];
    public user: User;
    public me: User;
    public loading = false;
    public canMutualWriteOff = false;
    public hasOwnOpenedNotes = false;

    ngOnInit(): void {
        this.me = this.authorizationService.getCurrentUser();
        this.route.queryParams.subscribe(async (params) => {
            this.user = await this.firebaseService.userService.getUser(params.userId);
            this.route.data.subscribe(data => {
                this.sortNotes(data.userNotes);
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
        if (openedNotes.length !== openedNotes.filter((note: Note) => note.ownerId === this.me.id).length) {
            this.canMutualWriteOff = true;
        }
        if (openedNotes.filter((note: Note) => note.ownerId === this.me.id).length > 0) {
            this.hasOwnOpenedNotes = true;
        }
        this.notes = [...openedNotes, ...closedNotes];
    }

    public isClosedNote(note: Note): boolean {
        if (note.ownerId === this.me.id) {
            return !note.openFor?.includes(this.user.id);
        } else {
            return !note.openFor?.includes(this.me.id);
        }
    }

    public openNoteView(note: Note) {
        this.cacheService.setValue(note.nowDate.toString(), note);
        this.router.navigate(['/add-new-note'], {queryParams: {noteId: note.nowDate}});
    }

    public getTotalSum(): number {
        const total = this.notes.reduce((result, note) => {
            if (!this.isClosedNote(note)) {
                return result + note.moneyPerPerson.find(e => e.personId === this.user.id).money;
            }
            return result;
        }, 0);
        return Number(total.toFixed(2));
    }

    private calculateMutualSum() {
        const sums = this.notes.reduce((result, note) => {
            if (!this.isClosedNote(note)) {
                if (note.ownerId === this.me.id) {
                    result[0] += note.moneyPerPerson.find(e => e.personId === this.user.id).money;
                } else {
                    result[1] += note.moneyPerPerson.find(e => e.personId === this.me.id).money;
                }
            }
            return result;
        }, [0, 0]);
        return Number(Math.min(...sums).toFixed(2));
    }

    public moveToMainPage() {
        history.back();
    }

    public openMutualConfirmDialog() {
        const total = this.calculateMutualSum();
        this.dialog.open(MutualConfirmDialog, {
            data: {
                amount: total,
                person: this.user
            }
        }).afterClosed()
            .pipe(filter(Boolean))
            .subscribe((l) => {
                console.log(l);
            });
    }

    public openConfirmDialog() {
        const total = this.getTotalSum();
        this.dialog.open(ConfirmDialog, {
            data: {
                amount: total,
                person: this.user
            }
        }).afterClosed()
            .pipe(
                filter(Boolean),
                map(Number))
            .subscribe(async result => {
                console.log(result);
                return;
                if (result) {
                    this.loading = true;
                    const updatedNotes = [];
                    this.notes.forEach(note => {
                        // if (note.selected) {
                        //     updatedNotes.push(note);
                        //     note.openFor?.splice(note.openFor.findIndex((userId) => userId === this.user.id), 1);
                        // }
                    });
                    updatedNotes.forEach(note => note.selected = false);
                    await this.firebaseService.updateNotes(updatedNotes);
                    await this.firebaseService.balanceService.updateBalance(this.me.id, this.user.id, total);
                    this.sortNotes(this.notes);
                    this.loading = false;
                }
            });
    }
}

@Component({
    selector: 'confirm-dialog',
    templateUrl: './dialogs/confirm.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.amountControl = new FormControl(data.amount, [Validators.required, Validators.max(999), Validators.min(1)]);
    }

    public amountControl: FormControl;
}

@Component({
    selector: 'mutual-confirm-dialog',
    templateUrl: './dialogs/mutual-confirm.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MutualConfirmDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
}
