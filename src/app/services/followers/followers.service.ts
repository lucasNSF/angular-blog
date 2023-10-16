import { Injectable } from '@angular/core';
import { BlogUser } from 'src/app/models/BlogUser';
import { CollectionsName } from 'src/app/models/CollectionsName';

import { FirestoreService } from '../firestore/firestore.service';

@Injectable()
export class FollowersService {
  constructor(private firestoreService: FirestoreService) {}

  async getTotalFollowers(uid: string): Promise<number> {
    const ref = await this.firestoreService.getDocument(
      CollectionsName.FOLLOWERS,
      uid
    );

    return Reflect.ownKeys(ref ?? {}).length;
  }

  async getFollowers(uid: string): Promise<BlogUser[] | null> {
    const ref = await this.firestoreService.getDocument(
      CollectionsName.FOLLOWERS,
      uid
    );

    if (!ref) return null;

    const followers: BlogUser[] = [];
    Reflect.ownKeys(ref).forEach(async (key) => {
      const follower = await this.firestoreService.getDocument(
        CollectionsName.USERS,
        Reflect.get(ref, key)
      );
      if (follower) followers.push(follower as BlogUser);
    });

    return followers;
  }

  async addFollower(uid: string, followerId: string): Promise<void> {
    const docRef = await this.firestoreService.getDocumentReference(
      CollectionsName.FOLLOWERS,
      uid
    );
    const payload = {};
    Reflect.set(payload, followerId, followerId);
    return this.firestoreService.updateDocument(docRef, payload);
  }

  async removeFollower(uid: string, followerId: string): Promise<boolean> {
    const follower = await this.firestoreService.getDocument(
      CollectionsName.FOLLOWERS,
      uid
    );
    if (!follower) return false;
    console.log(follower);
    Reflect.deleteProperty(follower, followerId);
    console.log(follower);
    const docRef = await this.firestoreService.getDocumentReference(
      CollectionsName.FOLLOWERS,
      uid
    );
    this.firestoreService.updateDocument(docRef, follower);
    return true;
  }
}
