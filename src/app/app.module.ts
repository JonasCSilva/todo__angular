import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NbThemeModule,
  NbLayoutModule,
  NbCheckboxModule,
  NbSpinnerModule,
  NbCardModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TodosListComponent } from './todos-list/todos-list.component';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { TodoDetailsComponent } from './todo-details/todo-details.component';
import { NbAuthModule, NbAuthService } from '@nebular/auth';
import {
  NbFirebaseAuthModule,
  NbFirebasePasswordStrategy,
} from '@nebular/firebase-auth';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

@NgModule({
  declarations: [AppComponent, TodosListComponent, TodoDetailsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbLayoutModule,
    NbEvaIconsModule,
    DragDropModule,
    NbCheckboxModule,
    NbSpinnerModule,
    NbCardModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)), // TODO test it
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    NbFirebaseAuthModule,
    NbAuthModule.forRoot({
      strategies: [
        NbFirebasePasswordStrategy.setup({
          name: 'password',
          requestPassword: {
            redirect: {
              success: null,
            },
          },
        }),
      ],
      forms: {
        login: {
          strategy: 'password',
          rememberMe: true,
        },
        logout: {
          strategy: 'password',
        },
        requestPassword: {
          strategy: 'password',
        },
        validation: {
          password: {
            required: true,
            minLength: 6,
            maxLength: 50,
          },
          email: {
            required: true,
          },
        },
      },
    }),
  ],
  providers: [NbAuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
