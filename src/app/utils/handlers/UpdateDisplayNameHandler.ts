import { take } from 'rxjs';
import { CollectionsName } from 'src/app/models/CollectionsName';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';

import { BaseHandler } from '../BaseHandler';

export class UpdateDisplayNameHandler extends BaseHandler {
  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {
    super();
  }

  override exec(data: { uid: string; displayName?: string }): unknown {
    if (data.displayName) {
      this.authService
        .updateAuthUser({ displayName: data.displayName })
        .pipe(take(1))
        .subscribe(() => console.log('displayName updated!'));

      this.firestoreService
        .getDocumentReference(CollectionsName.USERS, data.uid)
        .then((docRef) => {
          this.firestoreService.updateDocument(docRef, {
            displayName: data.displayName
          });
        });
    }
    return super.exec(data);
  }
}
