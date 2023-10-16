import { Post } from './Post';

export interface BlogUser {
  uid: string;
  displayName: string;
  photoURL: string;
  nickname: string;
  totalFollowers: number;
  totalFollowing: number;
  posts: Record<string, Post> | null;
}
