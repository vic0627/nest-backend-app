import {
  Controller,
  Get,
  Post,
  ValidationPipe,
  UsePipes,
  Body,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/creare-todo.dto';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  getAll() {
    return this.todoService.getTodos();
  }

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() dto: CreateTodoDto) {
    return {
      id: 1,
      ...dto,
    };
  }
}
