import { Injectable } from '@angular/core';
import { CollectionsName } from 'src/app/models/CollectionsName';
import { Post } from 'src/app/models/Post';
import { v4 as uuidv4 } from 'uuid';

import { FirestoreService } from '../firestore/firestore.service';

@Injectable()
export class PostsService {
  constructor(private firestoreService: FirestoreService) {}

  async getPosts(uid: string): Promise<Post | null> {
    const ref = await this.firestoreService.getDocument(
      CollectionsName.POSTS,
      uid
    );

    return ref as Post | null;
  }

  async publishPost(
    postInfo: {
      title: string;
      photoURL: string;
      description: string;
    },
    uid: string
  ) {
    const post = {
      ...postInfo,
      likes: 0,
      id: uuidv4()
    };
    const docRef = await this.firestoreService.getDocumentReference(
      CollectionsName.POSTS,
      uid
    );
    const payload = {};
    Reflect.set(payload, post.id, post);
    this.firestoreService.updateDocument(docRef, payload);
  }

  async likePost(uid: string, postId: string) {
    const docRef = await this.firestoreService.getDocumentReference(
      CollectionsName.POSTS,
      uid
    );
    if (!docRef) return;
    const userPosts = await this.getPosts(uid);
    const post: Post = Reflect.get(userPosts as Post, postId);
    Reflect.set(post, 'likes', post.likes + 1);
    this.firestoreService.updateDocument(docRef, userPosts as Post);
  }

  async unlikePost(uid: string, postId: string) {
    const docRef = await this.firestoreService.getDocumentReference(
      CollectionsName.POSTS,
      uid
    );
    if (!docRef) return;
    const userPosts = await this.getPosts(uid);
    const post: Post = Reflect.get(userPosts as Post, postId);
    Reflect.set(post, 'likes', post.likes - 1);
    this.firestoreService.updateDocument(docRef, userPosts as Post);
  }
}
