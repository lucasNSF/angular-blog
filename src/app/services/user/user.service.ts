import { Injectable, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import {
  getDocs,
  increment,
  limit,
  query,
  where
} from '@angular/fire/firestore';
import { Subscription, take } from 'rxjs';
import { UserInstanceError } from 'src/app/errors/UserInstanceError';
import { BlogUser } from 'src/app/models/BlogUser';
import { CollectionsName } from 'src/app/models/CollectionsName';
import { Handler } from 'src/app/utils/Handler';
import { UpdateDisplayNameHandler } from 'src/app/utils/handlers/UpdateDisplayNameHandler';
import { UpdatePasswordHandler } from 'src/app/utils/handlers/UpdatePasswordHandler';
import { UpdatePhotoURLHandler } from 'src/app/utils/handlers/UpdatePhotoURLHandler';

import { AuthService } from '../auth/auth.service';
import { FirestoreService } from '../firestore/firestore.service';
import { FollowersService } from '../followers/followers.service';
import { FollowingService } from '../following/following.service';
import { PostsService } from '../posts/posts.service';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  private authSubscription: Subscription;
  private authUser$!: User | null;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private followersService: FollowersService,
    private followingService: FollowingService,
    private postsService: PostsService
  ) {
    this.authSubscription = this.authService
      .getAuthUser()
      .subscribe((user) => (this.authUser$ = user));
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  createUser({
    nickname,
    email,
    password,
    displayName,
    photoURL
  }: {
    nickname: string;
    email: string;
    password: string;
    displayName: string;
    photoURL: string;
  }): Promise<unknown> {
    return this.firestoreService.performTransaction(async () => {
      await this.authService.createAuthUser(email, password);

      const interval = setInterval(async () => {
        if (this.authUser$) {
          await this.firestoreService.addDocumentWithCustomID(
            { nickname, displayName, photoURL, email },
            CollectionsName.USERS,
            this.authUser$.uid
          );
          await this.firestoreService.addDocumentWithCustomID(
            {},
            CollectionsName.FOLLOWERS,
            this.authUser$.uid
          );
          await this.firestoreService.addDocumentWithCustomID(
            {},
            CollectionsName.FOLLOWING,
            this.authUser$.uid
          );
          await this.firestoreService.addDocumentWithCustomID(
            {},
            CollectionsName.POSTS,
            this.authUser$.uid
          );
          clearInterval(interval);
        }
      }, 10000);
    });
  }

  async getUserByID(id?: string): Promise<BlogUser> {
    if (!id && !this.authUser$) {
      throw new UserInstanceError();
    } else if (!this.authUser$) {
      throw new UserInstanceError();
    }

    const userRef = await this.firestoreService.getDocument(
      CollectionsName.USERS,
      id ? id : this.authUser$.uid
    );
    const totalFollowers = await this.followersService.getTotalFollowers(
      id ? id : this.authUser$.uid
    );
    const totalFollowing = await this.followingService.getTotalFollowing(
      id ? id : this.authUser$.uid
    );
    const posts = await this.postsService.getPosts(
      id ? id : this.authUser$.uid
    );

    const user = {
      ...userRef,
      totalFollowers,
      totalFollowing,
      uid: id ? id : this.authUser$.uid,
      posts
    };

    return user as BlogUser;
  }

  followUser(targetUid: string): Promise<unknown> {
    return this.firestoreService.performTransaction(async () => {
      if (!this.authUser$) throw new UserInstanceError();
      const followingRef = await this.firestoreService.getDocumentReference(
        CollectionsName.USERS,
        targetUid
      );
      const userRef = await this.firestoreService.getDocumentReference(
        CollectionsName.USERS,
        this.authUser$.uid
      );

      await this.followingService.addFollowing(this.authUser$.uid, targetUid);
      await this.followersService.addFollower(targetUid, this.authUser$.uid);

      await this.firestoreService.updateDocument(userRef, {
        totalFollowing: increment(1)
      });
      await this.firestoreService.updateDocument(followingRef, {
        totalFollowers: increment(1)
      });
    });
  }

  // TODO: Testar isso!
  async getUsersByNickname(nickname: string): Promise<BlogUser[]> {
    const userCollection = this.firestoreService.getCollection(
      CollectionsName.USERS
    );

    const q = query(
      userCollection,
      where('nickname', '==', nickname),
      limit(10)
    );

    const users: BlogUser[] = [];
    const querySnap = await getDocs(q);
    querySnap.forEach((document) => users.push(document.data() as BlogUser));
    return users;
  }

  updateUserProfile(data: {
    displayName?: string;
    photoURL?: string;
    password?: string;
  }) {
    if (!this.authUser$) throw new UserInstanceError();

    const handler: Handler = new UpdateDisplayNameHandler(
      this.authService,
      this.firestoreService
    );
    handler
      .setNext(
        new UpdatePhotoURLHandler(this.authService, this.firestoreService)
      )
      .setNext(new UpdatePasswordHandler(this.authService));

    handler.exec({ uid: this.authUser$.uid, ...data });
  }

  async deleteUser(): Promise<void> {
    const success = (await this.firestoreService.performTransaction(
      async () => {
        try {
          if (!this.authUser$) throw new UserInstanceError();
          const userRef = await this.firestoreService.getDocumentReference(
            CollectionsName.USERS,
            this.authUser$.uid
          );
          const postsRef = await this.firestoreService.getDocumentReference(
            CollectionsName.POSTS,
            this.authUser$.uid
          );
          const followersRef = await this.firestoreService.getDocumentReference(
            CollectionsName.FOLLOWERS,
            this.authUser$.uid
          );
          const followingRef = await this.firestoreService.getDocumentReference(
            CollectionsName.FOLLOWING,
            this.authUser$.uid
          );

          await this.firestoreService.deleteDocument(userRef);
          await this.firestoreService.deleteDocument(postsRef);
          await this.firestoreService.deleteDocument(followersRef);
          await this.firestoreService.deleteDocument(followingRef);
          return true;
        } catch (err) {
          return false;
        }
      }
    )) as boolean;

    if (success) this.authService.deleteAuthUser().pipe(take(1)).subscribe();
  }
}
