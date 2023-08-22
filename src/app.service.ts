import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance } from 'axios';
import { Observable, map, delay } from 'rxjs';
import { Todo } from './common/models/todo.model';

@Injectable()
export class AppService {
  constructor(private readonly http: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getTodos(): Observable<Todo[]> {
    return this.http
      .get<Todo[]>('https://jsonplaceholder.typicode.com/todos')
      .pipe(
        delay(4000),
        map((res) => res.data),
      );
  }

  getInstance(): AxiosInstance {
    return this.http.axiosRef;
  }
}
