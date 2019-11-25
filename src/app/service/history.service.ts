import firebase from '../../../node_modules/firebase';
import {OfflineDatabase} from './firebase.service';
import {AllNotes, Note} from '../private/add-new-note/note';
import {BehaviorSubject} from 'rxjs';
import {templateJitUrl} from '@angular/compiler';

export class HistoryService {

    private allNotes: AllNotes;
    public onAllNotesUpdate = new BehaviorSubject<AllNotes>(null);
    private sendAllNotesUpdate = false;

    constructor(private database: firebase.database.Database, protected functions: firebase.functions.Functions,
                private offlineDatabase: OfflineDatabase) {
        this.offlineDatabase.getAllNotes().then(notes => {
            this.allNotes = notes;
            if (this.sendAllNotesUpdate) {
                this.onAllNotesUpdate.next(this.allNotes);
            }
        });
    }

    public async addNewNote(note: Note, toOnline = false) {
        this.allNotes[new Date().getTime().toString()] = note;
        await this.offlineDatabase.addNewNote(note);
        this.onAllNotesUpdate.next(this.allNotes);
        if (toOnline) {
            await this.database.ref('/notes').push(note);
        }
    }

    public getAllNotes(): AllNotes {
        setTimeout(() => this.loadAllNotes(this.onAllNotesUpdate), 2000);
        this.sendAllNotesUpdate = !this.allNotes;
        return this.allNotes;
    }

    private loadAllNotes(subject?: BehaviorSubject<AllNotes>): Promise<AllNotes> {
        return this.database.ref('/notes').once('value').then(snapshot => {
            const allNotes = snapshot.val() as AllNotes;
            if (allNotes.lastUpdateDate > ((this.allNotes && this.allNotes.lastUpdateDate) || 0)) {
                this.offlineDatabase.loadAllNotes(allNotes);
                if (!!subject) {
                    subject.next(allNotes);
                }
                return allNotes;
            } else {
                return this.allNotes;
            }
        });
    }
}


