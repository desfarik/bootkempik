import {Routes} from "@angular/router";
import {LoginComponent} from "./public/login/login.component";
import {MainComponent} from "./private/main/main.component";
import {TokenGuard} from "./service/guard/token.guard";
import {AddNewNoteComponent} from "./private/add-new-note/add-new-note.component";
import {UserNotesComponent} from "./private/user-notes/user-notes.component";
import {UserNotesResolver} from "./private/user-notes/resolver/user-notes-resolver.service";
import {ViewNoteResolver} from "./private/add-new-note/resolver/view-note-resolver.service";

export const AppRoutes: Routes = [
  {
    path: '',
    canActivateChild: [TokenGuard],
    children: [
      {
        path: '',
        component: MainComponent,
      }, {
        path: 'add-new-note',
        resolve: {note: ViewNoteResolver},
        component: AddNewNoteComponent,
        data: {animation: 'AddNewNote'}
      }, {
        path: 'user-notes',
        resolve: {userNotes: UserNotesResolver},
        component: UserNotesComponent,
        data: {animation: 'UserNotes'}
      },
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    component: MainComponent,
  }
];
