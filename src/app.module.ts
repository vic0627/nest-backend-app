import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  OnModuleInit,
  OnApplicationBootstrap,
  OnModuleDestroy,
  BeforeApplicationShutdown,
  OnApplicationShutdown,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './features/todo/todo.module';
import { LoggerMiddleware } from './middlewares/logger/logger.middleware';
import { AddUserMiddleware } from './middlewares/add-user/add-user.middleware';
// import { CopyTodoModule } from './features/copy-todo/copy-todo.module';
// import { HandsomeModule } from './handsome/handsome.module';
// import { ConfigurationModule } from './common/configuration/configuration.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configurationFactory from './config/configuration.factory';
import appConfigurationFactory from './config/app-configuration.factory';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MulterHelper } from './core/helpers/multer.helper';
import { HttpModule } from '@nestjs/axios';
import { Agent } from 'https';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './features/user/user.module';
import { MailerService } from './common/mailer/mailer.service';
import mongoFactory from './config/mongo.factory';
import mailerFactory from './config/mailer.factory';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './features/auth/auth.module';
import { CaptchaService } from './common/captcha/captcha.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.env.NODE_ENV || ''}.env`,
      load: [
        configurationFactory,
        appConfigurationFactory,
        mongoFactory,
        mailerFactory,
      ],
      expandVariables: true,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
      }),
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        httpsAgent: new Agent({ rejectUnauthorized: false }),
        timeout: config.get('HTTP_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
    TodoModule,
    MulterModule.register({
      storage: diskStorage({
        destination: MulterHelper.destination,
        filename: MulterHelper.filenameHandler,
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailerService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    CaptchaService,
  ],
})
export class AppModule
  implements
    NestModule,
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy,
    BeforeApplicationShutdown,
    OnApplicationShutdown
{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AddUserMiddleware, LoggerMiddleware)
      .forRoutes(
        { path: '/todos', method: RequestMethod.POST },
        { path: '/', method: RequestMethod.GET },
        { path: '/session', method: RequestMethod.GET },
      );
  }

  onModuleInit() {
    console.log('[AppModule] onModuleInit');
  }

  onApplicationBootstrap() {
    console.log('[AppModule] onApplicationBootstrap');
  }

  onModuleDestroy() {
    console.log('[AppModule] onModuleDestroy');
  }

  beforeApplicationShutdown() {
    console.log('[AppModule] beforeApplicationShutdown');
  }

  onApplicationShutdown() {
    console.log('[AppModule] onApplicationShutdown');
  }
}
