import {Component, OnDestroy, OnInit} from '@angular/core';
import {FirebaseService} from '../../service/firebase.service';
import {AllNotes, Note} from '../add-new-note/note';
import {User} from '../../service/model/user';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {

    public notes: Note[];
    private subscription: Subscription;

    public orderTypes = [
        {value: (a, b) => b.date - a.date, viewValue: 'Сначала новые'},
        {value: (a, b) => a.date - b.date, viewValue: 'Сначала старые'},
    ];
    public selectedOrder = this.orderTypes[0].value;
    public allUsers: Map<number, User> = new Map();

    constructor(private firebaseService: FirebaseService) {
    }

    public async ngOnInit() {
        this.subscription = this.firebaseService.historyService.onAllNotesUpdate.subscribe(update => this.onNotesUpdate(update));

        (await this.firebaseService.userService.getAllUsers()).forEach(user => {
            this.allUsers.set(parseInt(user.id), user);
        });
        const allNotes = await this.firebaseService.historyService.getAllNotes();
        if (!allNotes) {
            return;
        }
        this.notes = Object.values(allNotes).filter(note => !!note.amount).sort(this.selectedOrder);
    }

    public onChangeOrder() {
        this.notes = this.notes.sort(this.selectedOrder);
    }

    private onNotesUpdate(allNotes: AllNotes) {
        if (!allNotes) {
            return;
        }
        console.log('update notes');
        this.notes = Object.values(allNotes).filter(note => !!note.amount).sort(this.selectedOrder);
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
