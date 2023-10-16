import { take } from 'rxjs';
import { CollectionsName } from 'src/app/models/CollectionsName';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';

import { BaseHandler } from '../BaseHandler';

export class UpdatePhotoURLHandler extends BaseHandler {
  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {
    super();
  }

  override exec(data: { uid: string; photoURL?: string }): unknown {
    if (data.photoURL) {
      this.authService
        .updateAuthUser({ photoURL: data.photoURL })
        .pipe(take(1))
        .subscribe(() => console.log('photoURL updated!'));

      this.firestoreService
        .getDocumentReference(CollectionsName.USERS, data.uid)
        .then((docRef) => {
          this.firestoreService.updateDocument(docRef, {
            photoURL: data.photoURL
          });
        });

      // TODO: Adicionar lógica de upload no firebase storage!
    }

    return super.exec(data);
  }
}
