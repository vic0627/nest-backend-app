import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    [key: string]: any;
  }
}

config();

// declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  app.enableShutdownHooks();
  app.use(
    session({
      secret: 'nestjs session',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: 600000 },
    }),
  );
  app.enableCors()
  await app.listen(port);

  console.log(`[App] listening at port ${port}!`);

  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }
}
bootstrap();
