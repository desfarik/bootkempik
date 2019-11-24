import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-select-participants',
  templateUrl: './select-participants-dialog.component.html',
  styleUrls: ['./select-participants-dialog.component.scss']
})
export class SelectParticipantsDialog implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<SelectParticipantsDialog>,) {
    this.data.persons.forEach(person => person.selected = false);
  }

  ngOnInit() {
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
