/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { CopyTodoService } from './copy-todo.service';

describe('TodoService', () => {
  let service: CopyTodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CopyTodoService],
    }).compile();

    service = module.get<CopyTodoService>(CopyTodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
