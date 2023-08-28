import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Email } from 'src/common/mailer/interfaces/mailer.interface';
import { CommonUtility } from 'src/core/utils/common.utility';
import { UserDocument } from 'src/common/models/user.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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

  generateJwt(user: UserDocument) {
    const { _id: id, name } = user;
    const payload = { id, name };
    return {
      ...payload,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserFromAuthenticationToken(token: string) {
    const payload = await this.jwtService.verify(token, {
      secret: this.configService.get('secrets.jwt'),
    });

    const userId = payload.id;

    if (userId) return await this.userService.findById(userId);
  }
}
