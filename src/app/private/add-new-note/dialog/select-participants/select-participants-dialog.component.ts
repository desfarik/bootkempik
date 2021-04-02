import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-select-participants',
    templateUrl: './select-participants-dialog.component.html',
    styleUrls: ['./select-participants-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectParticipantsDialog {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<SelectParticipantsDialog>) {
        this.data.persons.forEach(person => person.selected = false);
    }

    get isSubmitDisabled() {
        return !this.data.persons.some(person => person.selected);
    }

    public submit() {
        this.dialogRef.close(this.data.persons.filter(person => person.selected));
    }

    public submitAll() {
        this.dialogRef.close(this.data.persons);
    }

    public close() {
        this.dialogRef.close();
    }
}
