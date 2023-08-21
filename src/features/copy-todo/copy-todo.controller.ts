/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { CopyTodoService } from './copy-todo.service';

@Controller('copy-todos')
export class CopyTodoController {
  constructor(private readonly copyTodoService: CopyTodoService) {}

  @Post()
  create(@Body() body: { id: number; title: string; description: string }) {
    this.copyTodoService.createTodo(body);
    return body;
  }
}
