import { BaseHandler } from '../BaseHandler';
import { take } from 'rxjs';
import { EmailType } from 'src/app/models/EmailType';
import { AuthService } from 'src/app/services/auth/auth.service';

export class UpdatePasswordHandler extends BaseHandler {
  constructor(private authService: AuthService) {
    super();
  }

  override exec(data: { password?: string }): unknown {
    if (data.password) {
      this.authService
        .sendEmail(EmailType.UPDATE_PASSWORD)
        .pipe(take(1))
        .subscribe();
    }

    return;
  }
}
