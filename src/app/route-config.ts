import {Routes} from "@angular/router";
import {LoginComponent} from "./public/login/login.component";
import {MainComponent} from "./private/main/main.component";
import {TokenGuard} from "./service/guard/token.guard";
import {AddNewNoteComponent} from "./private/add-new-note/add-new-note.component";

export const AppRoutes: Routes = [
  {
    path: '',
    canActivateChild: [TokenGuard],
    children: [
      {
        path: '',
        component: MainComponent
      }, {
        path: 'add-new-note',
        component: AddNewNoteComponent
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
