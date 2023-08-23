import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance } from 'axios';
import { Observable, map, delay } from 'rxjs';
import { TodoItem } from './common/models/todo.model';

@Injectable()
export class AppService {
  constructor(private readonly http: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getTodos(): Observable<TodoItem[]> {
    return this.http
      .get<TodoItem[]>('https://jsonplaceholder.typicode.com/todos')
      .pipe(
        delay(4000),
        map((res) => res.data),
      );
  }

  getInstance(): AxiosInstance {
    return this.http.axiosRef;
  }
}
