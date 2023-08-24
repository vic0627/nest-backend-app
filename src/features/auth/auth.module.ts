import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { MailerService } from 'src/common/mailer/mailer.service';
import { CaptchaService } from 'src/common/captcha/captcha.service';
import { AuthService } from './auth.service';
import { LocalStrategy } from './stratgies/local.strategy';
import { PassportModule } from '@nestjs/passport';


@Module({
  imports: [UserModule, PassportModule],
  controllers: [AuthController],
  providers: [MailerService, CaptchaService, AuthService, LocalStrategy]
})
export class AuthModule {}
