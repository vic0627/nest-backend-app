import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { UserDTO } from 'src/common/models/user.model';
import { CaptchaService } from 'src/common/captcha/captcha.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  private readonly sendLimitTime: number = 60000;
  private readonly captchaExpTime: number = 600000;

  constructor(
    private readonly userService: UserService,
    private readonly captchaService: CaptchaService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('signup')
  async signup(@Body() user: UserDTO) {
    const { email } = user;
    const hasSigned = await this.userService.hasUser(email);

    if (hasSigned)
      throw new HttpException('該帳號已註冊!', HttpStatus.BAD_REQUEST);

    return this.userService.createUser(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  signin(@Req() request: Request) {
    return request.user;
  }

  @Post('validate-email')
  async validateEmail(@Body() body: any, @Req() req: Request) {
    const { email } = body;
    const date = Date.now();
    const limitTime = this.sendLimitTime + req.session[email]?.date;

    if (!email)
      throw new HttpException('缺少信箱欄位!', HttpStatus.BAD_REQUEST);
    if (limitTime >= date) {
      const leftTime = Math.floor((limitTime - date) / 1000);
      throw new HttpException(
        `已產生驗證碼，剩餘冷卻時間 ${leftTime} 秒!`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const captcha = this.captchaService.sixNumCaptcha();

    req.session[email] = { captcha, date };

    return await this.mailerService.sendMail({
      to: email,
      subject: '[🐷豬排國際🐷]會員註冊信箱驗證',
      html: `<p>您的驗證碼是：<span style="font-size: 32px;">${captcha}</span></p>`,
    });
  }

  @Post('validate-email-check')
  validateEmailCheck(@Body() body: any, @Req() req: Request) {
    const { email, captcha } = body;

    if (!email)
      throw new HttpException('缺少信箱欄位!', HttpStatus.BAD_REQUEST);
    if (!captcha)
      throw new HttpException('缺少驗證碼欄位!', HttpStatus.BAD_REQUEST);
    if (!req.session[email])
      throw new HttpException('尚未產生驗證碼!', HttpStatus.BAD_REQUEST);
    if (req.session[email].date + this.captchaExpTime < Date.now())
      throw new HttpException('驗證碼已過期!', HttpStatus.BAD_REQUEST);

    return req.session[email].captcha === captcha;
  }
}
