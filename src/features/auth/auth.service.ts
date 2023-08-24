import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Email } from 'src/common/mailer/interfaces/mailer.interface';
import { CommonUtility } from 'src/core/utils/common.utility';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(email: Email, password: string) {
    const user = await this.userService.findUser({ email });
    const { hash } = CommonUtility.encryptBySalt(
      password,
      user?.password?.salt,
    );

    if (!user || hash !== user?.password?.hash) {
      return null;
    }

    return user;
  }
}
