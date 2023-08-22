# Controller

一個處理客戶端請求，並將相同性質的資源整合在一起的元件。

![Controller](./imgs/c3.png)

- [建置](#建置)
- [Route 路由](#route-路由)
  - [HTTP Methods](#http-methods)
  - [Children Route 子路由](#children-route-子路由)
  - [通用路由符號](#通用路由符號)
  - [Path Parameters 路由參數](#path-parameters-路由參數)
  - [Query Parameters 查詢參數](#query-parameters-查詢參數)
  - [Http Code 狀態碼](#http-code-狀態碼)
  - [Body 主體資料](#body-主體資料)
  - [DTO](#dto)
  - [Headers 標頭](#headers-標頭)
  - [參數裝飾器](#參數裝飾器)
  - [處理回應的方式](#處理回應的方式)
    - [標準模式](#標準模式)
    - [函式庫模式](#函式庫模式)
    - [模式的限制](#模式的限制)

## 建置

使用 NestCLI 快速生成：

```bash
nest generate controller <CONTROLLER_NAME>
```

生成的 Controller 會置於 `src/<CONTROLLER_NAME>` 路徑下。

## Route 路由

在建置完 Controller 基本骨架後，會發現 `todo.controller.ts` 的 `@Controller` 多了一個字串 `todo`，這是路由的 **前綴 (prefix)**。

>**注意**：透過 NestCLI 建立的 Controller 前綴預設使用該 Controller 的名稱，通常會習慣把名稱取單數，而前綴改為複數。

### HTTP Methods

可以透過添加裝飾器在 `class` 的方法上，來指定不同 Http Method 所呼叫的方法，Nest 會根據 Controller 與指定的 Http Method 裝飾器來建立路由表。

Nest 的 Http Methods 裝飾器名稱即對應標準 Http Methods：

- `@Get`：表示接收對應路由且為 `GET` 請求時觸發。
- `@Post`：表示接收對應路由且為 `POST` 請求時觸發。
- `@Put`：表示接收對應路由且為 `PUT` 請求時觸發。
- `@Patch`：表示接收對應路由且為 `PATCH` 請求時觸發。
- `@Delete`：表示接收對應路由且為 `DELETE` 請求時觸發。
- `@Options`：表示接收對應路由且為 `OPTIONS` 請求時觸發。
- `@Head`：表示接收對應路由且為 `HEAD` 請求時觸發。
- `@All`：表示接收對應路由且為以上任何方式的請求時觸發。

### Children Route 子路由

可以透過 Http Method 裝飾器指定子路由，會基於 Controller 設置的前綴來建立。

### 通用路由符號

>**注意**：該用法使用上需要謹慎，基本上除了 `?` 以外，都是被允許的字元。

在指定路由時使用 `*`，提供請求時些許的容錯空間：

```ts
@Controller('todos')
export class TodoController {
  @Get('exam*ples')
  get() {
    return [];
  }
}
```

上例中，不管使用 `/todos/exammmmples` 或 `/todos/exam_ples` 都能夠成功請求。

### Path Parameters 路由參數

在 Http Method 裝飾器上做定義，字串格式為 `:<PARAMETER_NAME>`，在該方法中添加帶有 `@Param` 裝飾器的參數，就可以順利取得路由參數，或是在 `@Param` 帶入指定參數名稱。

```ts
@Controller('todos')
export class TodoController {
  @Get(':id')
  get(@Param() params: { id: string }) {
    const { id } = params;
    return [{ id }];
  }

  @Get(':name')
  get(@Param('name'), name: string) {
    return [{ name }]
  }
}
```

### Query Parameters 查詢參數

查詢參數與路由參數取得的方式很相似，只需要在方法中添加帶有 `@Query` 的參數即可。

```ts
@Controller('todos')
export class TodoController {
  @Get()
  getList(@Query() query: { limit: number, skip: number }) {
    const { limit = 30, skip = 0 } = query;
    return [{ limit, skip }];
  }
}
```

也可以取得特定查詢參數，就是在 @Query 帶入指定參數名稱：

```ts
@Controller('todos')
export class TodoController {
  @Get()
  getList(
    @Query('limit') limit: number,
    @Query('skip') skip: number
  ) {
    return [{ limit, skip }];
  }
}
```

### Http Code 狀態碼

Nest 提供了狀態碼的 enum，並用裝飾器來設置回傳的狀態碼。

```ts
@Controller('todos')
export class TodoController {
  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  get() {
    return [];
  }
}
```

### Body 主體資料

Nest 有提供 @Body 裝飾器來取得主體資料：

```ts
@Controller('todos')
export class TodoController {
  @Post()
  create(@Body() data: { title: string, description?: string }) {
    const id = 1;
    return { id, ...data };
  }
}
```

也可以透過指定參數名稱來取得特定參數：

```ts
@Controller('todos')
export class TodoController {
  @Post()
  create(
    @Body('title') title: string,
    @Body('description') description?: string
  ) {
    const id = 1;
    return { id, title, description };
  }
}
```

### DTO

**資料傳輸物件 (Data Transfer Object)**，通常用於過濾、格式化資料，它只負責存放要傳遞的資訊，故只有**唯讀屬性**，沒有任何方法。定義 DTO 之後，就不必一直翻文件查到底參數格式為何，可以很清楚了解傳入 / 傳出的參數內容。

建議採用 `class` 的形式來建立 DTO，原因是 `interface` 在編譯成 js 就會被刪除，而 `class` 會保留。

在要調整的 Controller 目錄下，新增一個名為 `dto` 的資料夾，並建立 `create-<CONTROLLER_NAME>.dto.ts`：

```ts
export class CreateTodoDto {
  public readonly title: string;
  public readonly description?: string;
}
```

建立完畢後，在 Controller 中使用，將帶有 @Body 裝飾器之參數的型別指定為該 DTO：

```ts
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todos')
export class TodoController {
  @Post()
  create(@Body() dto: CreateTodoDto) {
    const id = 1;
    return { id, ...dto };
  }
}
```

### Headers 標頭

有時候可能需要設置標頭來回傳給用戶端，這時候就可以用 `@Header` 裝飾器來配置：

```ts
@Controller('todos')
export class TodoController {
  @Get()
  @Header('X-Hao-headers', '1')
  getAll() {
    return 'All';
  }
}
```

### 參數裝飾器

Nest 是以 Express 或 Fastify 作為底層基礎進行整合的框架，在很多地方都是對底層平台進行包裝的，其中的參數正是包裝出來的，透過特定的參數裝飾器來取得不同的資訊，除了前面幾項以外，還有許多參數裝飾器來提供開發人員取得更多資訊：

- `@Request()`：請求的裝飾器，帶有此裝飾器的參數會賦予底層框架的 **請求物件 (Request Object)**，該裝飾器有別稱 `@Req()`，通常將參數名稱取為 `req`。
- `@Response()`：回應的裝飾器，帶有此裝飾器的參數會賦予底層框架的 `回應物件 (Response Object)`，該裝飾器有別稱 `@Res()`，通常將參數名稱取為 `res`。
- `@Next()`：Next 函式的裝飾器，帶有此裝飾器的參數會賦予底層框架的 Next 函式，用途為呼叫下一個 中介軟體 (Middleware)，詳細說明可以參考我先前寫的 Express 基本結構與路由。
- `@Param(key?: string)`：路由參數的裝飾器，相當於 `req.params` 或 `req.params[key]`。
- `@Query(key?: string)`：查詢參數的裝飾器，相當於 `req.query` 或 `req.query[key]`。
- `@Body(key?: string)`：主體資料的裝飾器，相當於 `req.body` 或 `req.body[key]`。
- `@Headers(name?: string)`：請求標頭的裝飾器，相當於 `req.headers` 或 `req.headers[name]`。
- `@Session()`：session 的裝飾器，相當於 `req.session`。
- `@Ip()`：IP 的裝飾器，相當於 `req.ip`。
- `@HostParam()`：host 的裝飾器，相當於 `req.hosts`。

### 處理回應的方式

除了 `return` 之外，Nest 還提供了兩種處理回應的方式：

#### 標準模式

透過 `return` 讓 Nest 處理回應動作，官方最推薦的方式。

- 非同步
    使用 ES7 的 `async/await`。
- RxJS
    RxJS 是近年來十分熱門的函式庫，在 Angular 中可以經常看到它的身影，而受到 Angular 啟發的 Nest 也跟進使用了 RxJS。
    Nest 會自動訂閱 / 取消訂閱對象，無須手動取消訂閱。

#### 函式庫模式

使用底層框架的回應物件來處理回應，不透過 return 的方式讓 Nest 處理。

```ts
import { Response } from 'express';

@Controller('todos')
export class TodoController {
  @Get()
  getAll(@Res() res: Response) {
    res.send([]);
  }
}
```

>**注意**：須依照使用的底層框架來決定 res 的型別，範例中使用 Express 作為底層，故用其 Response 型別。

#### 模式的限制

Nest 會去偵測是否有帶 `@Res`、`@Response`、`@Next` 裝飾器的參數，如果有的話，該資源就會啟用函式庫模式，而**標準模式會被關閉 (return 失效)**。

如果真的要從回應物件中取得資訊，但又想採用標準模式的話，只需要在裝飾器中添加 `passthrough: true` 即可：

```ts
import { Response } from 'express';

@Controller('todos')
export class TodoController {
  @Get()
  getAll(@Res({ passthrough: true }) res: Response) {
    return [];
  }
}
```
