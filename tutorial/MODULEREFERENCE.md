# Module Reference

- [使用 Module Reference](#使用-module-reference)
  - [獲取實例](#獲取實例)
  - [處理非預設作用域之 Provider](#處理非預設作用域之-provider)
    - [手動配置識別碼](#手動配置識別碼)
    - [共享子樹](#共享子樹)

Nest 有提供另一種不同的方式來取得內部 Provider 的實例，它叫 **模組參照 (Module Reference)**。

它是一個名叫 `ModuleRef` 的 `class`，可以對內部 Provider 做一些存取，可以說是該 Module 的 Provider 管理器。

## 使用 Module Reference

使用上與 Provider 注入的方式相同，在 `constructor` 注入即可：

```ts
// ...
import { ModuleRef } from '@nestjs/core';

@Controller()
export class AppController {
  constructor(
    private readonly moduleRef: ModuleRef
  ) {}
}
```

### 獲取實例

透過 `ModuleRef.get()` 方法可以取得 **當前 Module** 下的 **任何元件**，如：Controller、Service、Guard 等。

>**注意**：此方法無法在非預設作用域的配置下使用。

透過 `ModuleRef` 來取得 `AppService` 的實例，若要獲取的是全域實例，需要在 `ModuleRef.get()` 參數 `option` 的位置配置 `strict: false`：

```ts
// ...
import { ModuleRef } from '@nestjs/core';

@Controller()
export class AppController {
  private readonly appService: AppService;
  private readonly copyTodoService: CopyTodoService;

  constructor(
    private readonly moduleRef: ModuleRef
    ) {
      // 獲取一般實例
      this.appService = this.moduleRef.get(AppService);
      // 獲取全域實例
      this.copyTodoService = this.moduleRef.get(CopyTodoService, {
        strict: false,
      });
    }

    @Get()
    getHello() {
      const hello = this.appService.getHello();
      const todo = this.copyTodoService.getTodos();
      return { hello, todo };
    }
}
```

### 處理非預設作用域之 Provider

在非預設作用域 (`{ scope: Scope.REQUEST }`) 的配置下，需要透過 `resolve` 從自身的 **依賴注入容器子樹 (DI container sub-tree)** 返回實例，而每個子樹都有一個獨一無二的 **識別碼 (Context Identifier)**，因此每次 `resolve` 都會是 **不同的實例**。

先將 `AppService` 轉化成請求作用域：

```ts
@Injectable({ scope: Scope.REQUEST })
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

接著，在 `AppController` 中使用兩次 `resolve` 並比對他們是否為相同的實例：

```ts
@Controller()
export class AppController implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef
  ) {}

  async onModuleInit() {
    const [instance1, instance2] = await Promise.all([
      this.moduleRef.resolve(AppService),
      this.moduleRef.resolve(AppService)
    ]);

    console.log(instance1 === instance2); // false
  }
}
```

#### 手動配置識別碼

若要將多個 `resolve` 回傳相同的實例，可以透過指定識別碼讓它們使用相同的子樹，進而取得相同的實例。

在指定識別碼之前，可以透過 `ContextIdFactory` 這個 `class` 的 `create` 方法來產生識別碼：

```ts
// ...
import { ContextIdFactory, ModuleRef } from '@nestjs/core';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef
  ) {}

  async onModuleInit() {
    // 產生識別碼
    const identifier = ContextIdFactory.create();
    const [instance1, instance2] = await Promise.all([
      this.moduleRef.resolve(AppService, identifier),
      this.moduleRef.resolve(AppService, identifier)
    ]);

    console.log(instance1 === instance2); // true
  }
}
```

#### 共享子樹

在請求作用域下，可以透過 `ContextIdFactory` 的 `getByRequest` 來基於請求物件建立識別碼，進而達到共享子樹的效果。

>**補充**：共享子樹是 NestJS 的一種模組組織和依賴管理概念，它可以讓你在不同的模組中共享相同的實例，即使這些模組處於不同的容器（子樹）中。

在 `AppController` 中注入 `REQUEST` 並透過 `getByRequest` 取得識別碼，根據該識別碼來執行兩次 `resolve` 以及比對實例：

```ts
// ...
import { ContextIdFactory, ModuleRef, REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  @Get()
  async getTruth() {
    const identifier = ContextIdFactory.getByRequest(this.request);
    const [instance1, instance2] = await Promise.all([
      this.moduleRef.resolve(AppService, identifier),
      this.moduleRef.resolve(AppService, identifier)
    ]);

    return instance1 === instance2; // true
  }
}
```
