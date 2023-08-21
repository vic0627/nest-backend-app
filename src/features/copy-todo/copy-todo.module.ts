/* eslint-disable prettier/prettier */
import { Module, Global } from '@nestjs/common';
import { CopyTodoService } from './copy-todo.service';

@Global()
@Module({
  providers: [CopyTodoService],
  exports: [CopyTodoService],
})
export class CopyTodoModule {}
