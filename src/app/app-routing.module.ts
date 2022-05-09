import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoDetailsComponent } from './todo-details/todo-details.component';
import { TodosListComponent } from './todos-list/todos-list.component';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import {
  NbAuthComponent,
  NbLoginComponent,
  NbLogoutComponent,
  NbRequestPasswordComponent,
} from '@nebular/auth';

const routes: Routes = [
  { path: 'todos-list', component: TodosListComponent },
  {
    path: 'todo-details',
    component: TodoDetailsComponent,
    canActivate: [AngularFireAuthGuard],
  },
  {
    path: 'auth',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: NbLoginComponent,
      },
      {
        path: 'logout',
        component: NbLogoutComponent,
      },
      {
        path: 'request-password',
        component: NbRequestPasswordComponent,
      },
    ],
  },
  { path: '', redirectTo: 'todos-list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
