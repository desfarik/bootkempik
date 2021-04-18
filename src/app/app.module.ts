import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent, UpdateAvailableDialog} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {LoginComponent} from './public/login/login.component';
import {MainComponent} from './private/main/main.component';
import {AppRoutes} from './route-config';
import {
    MAT_DATE_FORMATS,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    MatTabsModule,
    MatToolbarModule
} from '@angular/material';
import {BalanceComponent} from './private/balance/balance.component';
import {AddNewNoteComponent, ErrorDialog} from './private/add-new-note/add-new-note.component';
import {ReactiveFormsModule} from '@angular/forms';
import {PersonPipe} from './private/add-new-note/money-spreader/pipes/person.pipe';
import {SelectParticipantsDialog} from './private/add-new-note/dialog/select-participants/select-participants-dialog.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ConfirmDialog, MutualConfirmDialog, UserNotesComponent} from './private/user-notes/user-notes.component';
import {DatePipe} from './private/user-notes/pipe/date.pipe';
import {MoneyPipe} from './private/user-notes/pipe/money.pipe';
import {PhotoUploaderComponent} from './private/add-new-note/photo-uploader/photo-uploader.component';
import {MoneySpreaderComponent} from './private/add-new-note/money-spreader/money-spreader.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {NoteDescriptionPipe} from './private/add-new-note/money-spreader/pipes/note-description.pipe';
import {NgxViewerjsModule} from 'ngx-viewerjs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {HttpErrorInterceptor} from "./interceptors/http-error-interceptor.service";
import {CookieInterceptor} from "./interceptors/cookie-interceptor.service";

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
        BalanceComponent,
        AddNewNoteComponent,
        PersonPipe,
        DatePipe,
        MoneyPipe,
        SelectParticipantsDialog,
        UserNotesComponent,
        ConfirmDialog,
        MutualConfirmDialog,
        ErrorDialog,
        PhotoUploaderComponent,
        MoneySpreaderComponent,
        NoteDescriptionPipe,
        UpdateAvailableDialog
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
        MatCheckboxModule,
        BrowserAnimationsModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        ScrollingModule,
        MatRippleModule,
        MatDialogModule,
        HttpClientModule,
        NgxViewerjsModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        RouterModule.forRoot(AppRoutes, {relativeLinkResolution: 'legacy'}),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: true,
            registrationStrategy: 'registerImmediately'
        }),
    ],
    exports: [
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    entryComponents: [SelectParticipantsDialog, ConfirmDialog, ErrorDialog, MutualConfirmDialog, UpdateAvailableDialog],

    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {
            provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CookieInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
