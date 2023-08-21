/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { HelloWorldInterceptor } from './interceptors/hello-world/hello-world.interceptor';
import { User } from './decorators/user/user.decorator';
// import { ParseIntPipe } from './pipes/parse-int/parse-int.pipe';
// import { RoleGuard } from './guards/role/role.guard';
// import { Roles } from './decorators/roles/roles.decorator';
// import { Auth } from './decorators/auth/auth.decorator';
// import { ConfigurationService } from './common/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { CopyTodoService } from './features/copy-todo/copy-todo.service';
// import { HandsomeModule } from './handsome/handsome.module';

@Controller()
@UseInterceptors(HelloWorldInterceptor)
export class AppController {
  private readonly appService: AppService;
  private readonly copyTodoService: CopyTodoService;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService,
  ) {
    this.appService = this.moduleRef.get(AppService);
    this.copyTodoService = this.moduleRef.get(CopyTodoService, {
      strict: false,
    });
  }

  // constructor(private readonly configService: ConfigService) {}

  // constructor(private readonly configService: ConfigurationService) {}

  // constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    const appService = this.appService.getHello();
    const SERECT_KEY = this.configService.get('SERECT_KEY');
    const PORT = this.configService.get('PORT');
    const database = this.configService.get('database');
    const host = this.configService.get('database.host');
    const app = this.configService.get('app');
    const todo = this.copyTodoService.getTodos();
    return { appService, SERECT_KEY, PORT, database, host, app, todo };
  }

  // @Get()
  // getHello() {
  //   return { username: this.configService.get('USERNAME') };
  // }

  // @Auth('staff')
  // @Get()
  // getHello(@User() user: any): any {
  //   return user;
  // }

  // @Get(':id')
  // getUser(@Param('id', ParseIntPipe) id: number) {
  //   return { id, name: 'Vic' };
  // }
}
