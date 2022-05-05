import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoDetailsComponent } from './todo-details/todo-details.component';
import { TodosListComponent } from './todos-list/todos-list.component';

const routes: Routes = [
  { path: 'todos-list', component: TodosListComponent },
  { path: 'todo-details', component: TodoDetailsComponent },
  { path: '', redirectTo: '/todos-list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
