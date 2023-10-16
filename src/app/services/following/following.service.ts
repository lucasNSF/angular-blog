import { Injectable } from '@angular/core';
import { BlogUser } from 'src/app/models/BlogUser';
import { CollectionsName } from 'src/app/models/CollectionsName';

import { FirestoreService } from '../firestore/firestore.service';

@Injectable()
export class FollowingService {
  constructor(private firestoreService: FirestoreService) {}

  async getTotalFollowing(uid: string): Promise<number> {
    const ref = await this.firestoreService.getDocument(
      CollectionsName.FOLLOWING,
      uid
    );

    return Reflect.ownKeys(ref ?? {}).length;
  }

  async getFollowing(uid: string): Promise<BlogUser[] | null> {
    const ref = await this.firestoreService.getDocument(
      CollectionsName.FOLLOWING,
      uid
    );

    if (!ref) return null;

    const following: BlogUser[] = [];
    Reflect.ownKeys(ref).forEach(async (key) => {
      const user = await this.firestoreService.getDocument(
        CollectionsName.USERS,
        Reflect.get(ref, key)
      );
      if (user) following.push(user as BlogUser);
    });

    return following;
  }

  async addFollowing(uid: string, followingId: string): Promise<void> {
    const docRef = await this.firestoreService.getDocumentReference(
      CollectionsName.FOLLOWING,
      uid
    );
    const payload = {};
    Reflect.set(payload, followingId, followingId);
    return this.firestoreService.updateDocument(docRef, payload);
  }

  async removeFollowing(uid: string, followingId: string): Promise<boolean> {
    const following = await this.firestoreService.getDocument(
      CollectionsName.FOLLOWING,
      uid
    );
    console.log(following);
    if (!following) return false;
    Reflect.deleteProperty(following, followingId);
    console.log(following);
    const docRef = await this.firestoreService.getDocumentReference(
      CollectionsName.FOLLOWING,
      uid
    );
    this.firestoreService.updateDocument(docRef, following);
    return true;
  }
}
