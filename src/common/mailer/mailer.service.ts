import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  Email,
  MailOptions,
  TransportOptions,
  SendMailOptions,
} from './interfaces/mailer.interface';

@Injectable()
export class MailerService {
  private transportOptions: TransportOptions;
  private transporter: any;

  constructor(private readonly configService: ConfigService) {
    this.createTransport();
  }

  public async sendMail({ to, subject, text, html }: SendMailOptions) {
    const mailOptions: MailOptions = {
      from: this.transportOptions.auth.user,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
    };

    if (html) mailOptions.html = html;
    else if (text) mailOptions.text = text;

    let mailInfo: string;

    await this.transporter.sendMail(mailOptions, (err: Error, info: any) => {
      if (err) {
        mailInfo = err.message;
      } else {
        mailInfo = 'Email sent: ' + info.response;
      }
    });

    return mailInfo;
  }

  private createTransport() {
    this.transportOptions = {
      service: 'gmail',
      auth: {
        user: this.configService.get('mailer.user'),
        pass: this.configService.get('mailer.pass'),
      },
    };

    this.transporter = nodemailer.createTransport(this.transportOptions);
  }
}
