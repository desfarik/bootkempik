import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from "@angular/router";
import {LoginComponent} from './public/login/login.component';
import {MainComponent} from './private/main/main.component';
import {AppRoutes} from "./route-config";
import {
  DateAdapter,
  MAT_DATE_FORMATS, MAT_DATE_LOCALE,
  MatButtonModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDividerModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule, MatNativeDateModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule,
  MatTabsModule,
  MatToolbarModule
} from "@angular/material";
import {HistoryComponent} from './private/history/history.component';
import {StatisticComponent} from './private/statistic/statistic.component';
import {BalanceComponent} from './private/balance/balance.component';
import {AddNewNoteComponent} from './private/add-new-note/add-new-note.component';
import {ReactiveFormsModule} from "@angular/forms";
import { MoneyPerPersonPipe } from './private/add-new-note/money-per-person.pipe';
import { PersonPipe } from './private/add-new-note/person.pipe';
import { SelectParticipantsDialog } from './private/add-new-note/select-participants/select-participants-dialog.component';
import { DatePipe } from './private/history/date.pipe';

const APP_DATE_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
    dateInput: {month: 'long', year: 'numeric', day: 'numeric'},
    monthYearLabel: {year: 'numeric'}
  }
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    HistoryComponent,
    StatisticComponent,
    BalanceComponent,
    AddNewNoteComponent,
    MoneyPerPersonPipe,
    PersonPipe,
    SelectParticipantsDialog,
    DatePipe
  ],
  imports: [
    MatButtonModule,
    MatTabsModule,
    BrowserModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDividerModule,
    MatChipsModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    RouterModule.forRoot(AppRoutes)
  ],
  exports: [
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  entryComponents:[SelectParticipantsDialog],

  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    },
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
