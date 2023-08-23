import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CopyTodoModule } from '../copy-todo/copy-todo.module';

@Module({
  controllers: [TodoController],
  providers: [TodoService],
  exports: [TodoService],
  imports: [CopyTodoModule],
})
export class TodoModule {}
