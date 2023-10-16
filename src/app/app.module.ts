import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth/auth.service';
import { FirestoreService } from './services/firestore/firestore.service';
import { FollowersService } from './services/followers/followers.service';
import { FollowingService } from './services/following/following.service';
import { PostsService } from './services/posts/posts.service';
import { UserService } from './services/user/user.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    BrowserAnimationsModule
  ],
  providers: [
    UserService,
    AuthService,
    FirestoreService,
    FollowersService,
    FollowingService,
    PostsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
