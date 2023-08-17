import {
  Controller,
  Get,
  Post,
  ValidationPipe,
  UsePipes,
  Body,
  HttpStatus,
  NotAcceptableException,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/creare-todo.dto';
import { ValidationError } from 'class-validator';

const exceptionFactory = (errors: ValidationError[]) => {
  return new NotAcceptableException({
    code: HttpStatus.NOT_ACCEPTABLE,
    message: '格式錯誤',
    errors,
  });
};

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  getAll() {
    return this.todoService.getTodos();
  }

  @Post()
  // @UsePipes()
  create(@Body() dto: CreateTodoDto) {
    const item = {
      id: this.todoService.getTodos().length + 1,
      ...dto,
    };
    this.todoService.createTodo(item);
    return item;
  }
}
