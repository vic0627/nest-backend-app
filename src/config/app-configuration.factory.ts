import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  domain: process.env.APP_DOMAIN,
  redirectURL: process.env.APP_REDIRECT_URL,
}));
