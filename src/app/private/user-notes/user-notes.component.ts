import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AllNotes, Note} from '../add-new-note/note';
import {User} from '../../service/model/user';
import {FirebaseService} from '../../service/firebase.service';
import {AuthorizationService} from '../../service/authorization.service';
import {CacheService} from '../../service/cache.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {filter, map, tap} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import {StatusAppService} from "../../service/status-app.service";

@Component({
    selector: 'app-user-notes',
    templateUrl: './user-notes.component.html',
    styleUrls: ['./user-notes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserNotesComponent implements OnInit {

    constructor(private route: ActivatedRoute,
                private firebaseService: FirebaseService,
                private authorizationService: AuthorizationService,
                private router: Router,
                private cacheService: CacheService,
                public dialog: MatDialog,
                public statusAppService: StatusAppService,
                private changeDetector: ChangeDetectorRef) {
    }

    public notes: Note[];
    public userAllNotes: AllNotes;
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
                this.userAllNotes = data.userNotes;
                this.sortNotes(Object.values(this.userAllNotes));
                this.changeDetector.detectChanges();
            });
        });
    }

    private sortNotes(userNotes: Note[]) {
        const closedNotes = [];
        const openedNotes = [];
        this.hasOwnOpenedNotes = this.canMutualWriteOff = false;
        userNotes.sort((a, b) => b.date - a.date)
            .forEach(note => {
                if (this.isClosedNote(note)) {
                    closedNotes.push(note);
                } else {
                    openedNotes.push(note);
                }
            });
        const myOpenedNotes = openedNotes.filter((note: Note) => note.ownerId === this.me.id).length;
        if (openedNotes.length !== myOpenedNotes && myOpenedNotes !== 0) {
            this.canMutualWriteOff = true;
        }
        if (myOpenedNotes > 0) {
            this.hasOwnOpenedNotes = true;
        }
        this.notes = [...openedNotes, ...closedNotes];
    }

    public isClosedNote(note: Note): boolean {
        if (note.ownerId === this.me.id) {
            return note.moneyPerPerson[this.user.id]?.paid;
        } else {
            return note.moneyPerPerson[this.me.id]?.paid;
        }
    }

    public openNoteView(noteToOpen: Note) {
        const noteId = Object.entries(this.userAllNotes).find(([, note]) => note === noteToOpen)[0];
        this.cacheService.setValue(noteId, noteToOpen);
        this.router.navigate(['/add-new-note'], {queryParams: {noteId}});
    }

    public getOpenedOwnerPositiveSum(): number {
        const total = this.notes.reduce((result, note) => {
            if (note.ownerId === this.me.id && !note.moneyPerPerson[this.user.id].paid) {
                return result + note.moneyPerPerson[this.user.id].money;
            }
            return result;
        }, 0);
        return Number(total.toFixed(2));
    }

    private calculateMutualSum(): [number, number] {
        const sums = this.notes.reduce((result, note) => {
            if (!this.isClosedNote(note)) {
                if (note.ownerId === this.me.id) {
                    result[0] += note.moneyPerPerson[this.user.id].money;
                } else {
                    result[1] += note.moneyPerPerson[this.me.id].money;
                }
            }
            return result;
        }, [0, 0]);
        if (sums[0] > sums[1]) {
            return [round(sums[1]), this.me.id];
        } else {
            return [round(sums[0]), this.user.id];
        }
    }

    public moveToMainPage() {
        history.back();
    }

    public openMutualConfirmDialog() {
        const [total, userId] = this.calculateMutualSum();
        this.dialog.open(MutualConfirmDialog, {
            data: {
                amount: total,
                person: this.user
            }
        }).afterClosed()
            .pipe(
                filter(Boolean),
                tap(this.showSpinner))
            .subscribe(async () => {
                const result = await this.firebaseService.balanceService.mutualWriteOffBalance(this.me.id, this.user.id, total, userId);
                const {newNotes, ownerClosedNoteIds, debtClosedNoteIds} = result;
                ownerClosedNoteIds.forEach(closedNoteId => this.userAllNotes[closedNoteId].moneyPerPerson[this.user.id].paid = true);
                debtClosedNoteIds.forEach(closedNoteId => this.userAllNotes[closedNoteId].moneyPerPerson[this.me.id].paid = true);

                Object.entries(newNotes).forEach(([noteId, note]) => {
                    this.userAllNotes[noteId] = note;
                });

                this.sortNotes(Object.values(this.userAllNotes));
                this.hideSpinner();
            });
    }

    public openConfirmDialog() {
        const total = this.getOpenedOwnerPositiveSum();
        this.dialog.open(ConfirmDialog, {
            data: {
                amount: total,
                person: this.user
            }
        }).afterClosed()
            .pipe(
                filter(Boolean),
                map(Number),
                tap(this.showSpinner))
            .subscribe(async sum => {
                const result = await this.firebaseService.balanceService.updateBalance(this.me.id, this.user.id, sum);
                const {newNotes, ownerClosedNoteIds} = result;
                ownerClosedNoteIds.forEach(closedNoteId => this.userAllNotes[closedNoteId].moneyPerPerson[this.user.id].paid = true);

                Object.entries(newNotes).forEach(([noteId, note]) => {
                    this.userAllNotes[noteId] = note;
                });

                this.sortNotes(Object.values(this.userAllNotes));
                this.hideSpinner();
            });
    }

    private showSpinner = () => {
        this.loading = true;
        this.changeDetector.detectChanges();
    }

    private hideSpinner = () => {
        this.loading = false;
        this.changeDetector.detectChanges();
    }
}

@Component({
    selector: 'confirm-dialog',
    templateUrl: './dialogs/confirm.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.amountControl = new FormControl(data.amount,
            [Validators.required,
                Validators.max(999),
                Validators.min(1),
                Validators.pattern(/^\d{1,3}([\\.,]\d{1,2})?$/)]);
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

export function round(noRoundedNumber: number): number {
    return Number(noRoundedNumber.toFixed(2));
}

