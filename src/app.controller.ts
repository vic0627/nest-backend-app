/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Inject,
  Param,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import { Response } from 'express';
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
import { Observable, filter, map } from 'rxjs';
import { Todo } from './common/models/todo.model';
import { ParseIntPipe } from './pipes/parse-int/parse-int.pipe';

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

  @Post('/upload-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    return file;
  }

  @Post('/upload-files')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultiFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(({ fieldname, originalname }) => ({
      fieldname,
      originalname,
    }));
  }

  @Post('/upload-multiple-files')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'filesA' }, { name: 'filesB' }]),
  )
  uploadMultipleFiles(
    @UploadedFiles() files: { [x: string]: Express.Multer.File[] },
  ) {
    const { filesA, filesB } = files;
    const list = [...filesA, ...filesB];
    return list.map(({ fieldname, originalname }) => ({
      fieldname,
      originalname,
    }));
  }

  @Post('/upload-multiple-files-any')
  @UseInterceptors(AnyFilesInterceptor())
  uploadAnyMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return files;
  }

  @Get('/http-todos')
  getTodos() {
    return this.appService.getTodos();
  }

  @Get('/http-todos/:userId')
  getTodo(@Param('userId', ParseIntPipe) userId: string) {
    const userIdNumber = parseInt(userId);
    return this.appService
      .getTodos()
      .pipe(
        map((todos) => todos.filter((todo) => todo.userId === userIdNumber)),
      );
  }

}
