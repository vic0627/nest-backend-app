/* eslint-disable prettier/prettier */
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './features/todo/todo.module';
import { LoggerMiddleware } from './middlewares/logger/logger.middleware';
import { AddUserMiddleware } from './middlewares/add-user/add-user.middleware';
// import { CopyTodoModule } from './features/copy-todo/copy-todo.module';
// import { HandsomeModule } from './handsome/handsome.module';
import { ConfigurationModule } from './common/configuration/configuration.module';

@Module({
  imports: [
    TodoModule,
    ConfigurationModule.forRoot({
      path: `../${process.env.NODE_ENV || 'development'}.env`,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AddUserMiddleware, LoggerMiddleware)
      .forRoutes(
        { path: '/todos', method: RequestMethod.POST },
        { path: '/', method: RequestMethod.GET },
      );
  }
}
