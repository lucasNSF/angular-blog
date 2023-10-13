import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  UserCredential
} from '@angular/fire/auth';
import { Observable, Subscription, switchMap } from 'rxjs';
import { UserInstanceError } from 'src/app/errors/UserInstanceError';
import { EmailType } from 'src/app/models/EmailType';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private user$ = user(this.auth);

  async createAuthUser(email: string, password: string): Promise<Subscription> {
    await createUserWithEmailAndPassword(this.auth, email, password);
    return this.sendEmail(EmailType.VERIFICATION).subscribe();
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signOut(): Promise<void> {
    return await signOut(this.auth);
  }

  updateAuthUser({
    displayName,
    photoURL
  }: {
    displayName?: string;
    photoURL?: string;
  }): Observable<void> {
    return this.user$.pipe(
      switchMap(async (user) => {
        if (!user) throw new UserInstanceError();
        return await updateProfile(user, { displayName, photoURL });
      })
    );
  }

  sendEmail(emailType: EmailType): Observable<void> {
    switch (emailType) {
      case EmailType.VERIFICATION:
        return this.user$.pipe(
          switchMap(async (user) => {
            if (!user) throw new UserInstanceError();
            return await sendEmailVerification(user, {
              // TODO: Mudar a URL de destino para a app web
              url: 'http://localhost:4200'
            });
          })
        );
      case EmailType.UPDATE_PASSWORD:
        return this.user$.pipe(
          switchMap(async (user) => {
            if (!user || !user.email) throw new UserInstanceError();
            return await sendPasswordResetEmail(this.auth, user.email, {
              // TODO: Mudar a URL de destino para a app web
              url: 'http://localhost:4200'
            });
          })
        );
    }
  }

  deleteAuthUser(): Observable<void> {
    return this.user$.pipe(
      switchMap(async (user) => {
        if (!user) throw new UserInstanceError();
        return await deleteUser(user);
      })
    );
  }

  getAuthUser() {
    return this.user$;
  }
}
