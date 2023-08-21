/* eslint-disable prettier/prettier */
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
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './features/todo/todo.module';
import { LoggerMiddleware } from './middlewares/logger/logger.middleware';
import { AddUserMiddleware } from './middlewares/add-user/add-user.middleware';
// import { CopyTodoModule } from './features/copy-todo/copy-todo.module';
// import { HandsomeModule } from './handsome/handsome.module';
// import { ConfigurationModule } from './common/configuration/configuration.module';
import { ConfigModule } from '@nestjs/config';
import configurationFactory from './config/configuration.factory';
import dbConfigurationFactory from './config/db-configuration.factory';
import appConfigurationFactory from './config/app-configuration.factory';

@Module({
  imports: [
    TodoModule,
    ConfigModule.forRoot({
      envFilePath: `${process.env.NODE_ENV || ''}.env`,
      load: [
        configurationFactory,
        dbConfigurationFactory,
        appConfigurationFactory,
      ],
      expandVariables: true,
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
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
