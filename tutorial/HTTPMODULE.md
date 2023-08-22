# HttpModule

Nest 內建了 HTTP Module，它是基於 [`axios`](https://www.npmjs.com/package/axios) 進行包裝的模組，讓 Nest 開發人員不必為使用哪個套件煩惱。

>**注意**：在第 8 版後的 NestJS 已經將 HTTP Module 獨立成 `@nestjs/axios` 套件，若使用第 8 版後的 NestJS 需要另外使用 `npm install @nestjs/axios` 進行安裝。

- [使用 HttpModule](#使用-httpmodule)
- [預設 axios 配置](#預設-axios-配置)
  - [使用環境變數](#使用環境變數)

## 使用 HttpModule

`HttpModule` 匯出了一個 `HttpService` 的 Service，其提供 `axios` 的方法來處理 HTTP 請求，並且使用 `Observable` 的形式。

```ts
// ...
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

這邊使用 [JSONPlaceholder](https://jsonplaceholder.typicode.com/) 做為示範的第三方 API，並使用 `todos` 的資源，將其資料結構用 `interface` 的方式存在 `src/common/models` 資料夾中的 `todo.model.ts`：

```ts
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
```

調整一下 `app.service.ts` 的內容，透過 `getTodos` 方法去取得 `todos` 的資源：

```ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Agent } from 'https';
import { Observable, map } from 'rxjs';
import { Todo } from './common/models/todo.model';

@Injectable()
export class AppService {
  constructor(private readonly http: HttpService) {}
  getTodos(): Observable<Todo[]> {
    const httpsAgent = new Agent({ rejectUnauthorized: false });
    return this.http
      .get<Todo[]>('https://jsonplaceholder.typicode.com/todos', {
        httpsAgent,
      })
      .pipe(map((res) => res.data));
  }
}
```

>**注意**：由於 Agent 的問題，這裡我們需要配置 `httpsAgent` 的 `rejectUnauthorized` 為 `false` 以正常使用此 API。

結合之前的 `pipe` 及 `@Param`，調整 `app.controller.ts`：

```ts
// ...
@Get('/http-todos')
getTodos() {
  // 取得完整 todoList
  return this.appService.getTodos();
}

@Get('/http-todos/:userId')
getTodo(@Param('userId', ParseIntPipe) userId: string) {
  // 依 useId 過濾 todoList
  return this.appService
    .getTodos()
    .pipe(
      map((todos) => todos.filter((todo) => todo.userId === parseInt(userId))),
    );
}
// ...
```

## 預設 axios 配置

在上述範例中，會發現存取 JSONPlaceholder 的 `todos` 資源會碰到 `Agent` 的問題，如果有多個 API 都會碰到此問題，這時候就可以運用 `HttpModule` 的 `register` 方法來配置預設值，具體的內容可以參考[官方說明](https://github.com/axios/axios#request-config)。

以 `app.module.ts` 為例，將 `Agent` 的配置設為預設值：

```ts
@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new Agent({ rejectUnauthorized: false })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

接著調整 `app.service.ts`，將本來配置好的 `Agent` 配置移除。

### 使用環境變數

`HttpModule` 有提供 `registerAsync` 方法，透過這個方法可以添加依賴的 Provider，並用工廠函式將其值帶入 `HttpModule`，運用這樣的機制來注入 `ConfigService`，進而將要配置的預設值帶入。

在 `.env` 添加下方的環境變數：

```text
HTTP_TIMEOUT=3000
```

修改 `app.module.ts` 的內容，在 `registerAsync` 匯入 `ConfigModule` 並在 `injects` 帶入 `ConfigService`，最後在 `useFactory` 注入 `ConfigService`：

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        httpsAgent: new Agent({ rejectUnauthorized: false }),
        timeout: config.get('HTTP_TIMEOUT')
      }),
      inject: [
        ConfigService
      ]
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
