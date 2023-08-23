import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => {
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;

  return {
    user,
    pass,
  };
});
