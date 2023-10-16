import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentReference,
  Firestore,
  getCountFromServer,
  getDoc,
  runTransaction,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  createCollection(name: string) {
    return collection(this.firestore, name);
  }

  getCollection(name: string) {
    return this.createCollection(name);
  }

  async addDocument<T extends object>(doc: T, colRef: CollectionReference) {
    return await addDoc(colRef, doc);
  }

  async addDocumentWithCustomID<T extends object>(
    document: T,
    colName: string,
    customID: string
  ) {
    return await setDoc(doc(this.firestore, colName, customID), document);
  }

  async getDocument(colName: string, docId: string) {
    const docRef = doc(this.firestore, colName, docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data();
  }

  async getDocumentReference(colName: string, docId: string) {
    return doc(this.firestore, colName, docId);
  }

  async getTotalDocuments(colRef: CollectionReference) {
    return await getCountFromServer(colRef);
  }

  async updateDocument<T extends object>(
    docRef: DocumentReference,
    payload: T
  ) {
    return await updateDoc(docRef, payload);
  }

  async deleteDocument(docRef: DocumentReference) {
    return await deleteDoc(docRef);
  }

  async performTransaction(callback: () => Promise<unknown>): Promise<unknown> {
    try {
      const returnState = await runTransaction(this.firestore, callback);
      return returnState;
    } catch (err) {
      return err;
    }
  }
}
