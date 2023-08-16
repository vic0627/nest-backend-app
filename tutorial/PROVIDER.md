# Provider

Provider 透過**控制反轉容器**做實例的管理，可以很方便且有效地使用這些 Provider，而 Provider 大致上可以分成兩種：

## 標準 Provider

這是最簡單的作法，也是大多數 Service 的作法，在 class 上添加 @Injectable 讓 Nest 知道這個 class 是可以由控制反轉容器管理的。

```bash
nest generate service <SERVICE_NAME>
```

以 `app.service.ts` 為例：

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

而在 Module 中，只需要於 providers 中聲明該 Service 即可。

## 自訂 Provider

如果覺得標準 Provider 無法滿足需求，如：

- 想自行建立一個實例，而不是透過 Nest 建立。
- 想要在其他依賴項目中重用實例。
- 使用模擬版本的 `class` 進行覆寫，以便做測試。

Nest 提供了多種方式來自訂 Provider，都是透過展開式進行定義：

### Value Provider

- 提供常數 (Constant)。
- 將外部函式庫注入到控制反轉容器。
- 將 `class` 抽換成特定的模擬版本。

使用時在展開式中用 `useValue` 來配置，以 `app.module.ts` 為例：

```ts
@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    {
      provide: AppService,
      useValue: {
        name: 'VIC'
      }
    }
  ],
})
export class AppModule {}
```

修改 `app.controller.ts` 來查看 `token` 為 `AppService` 的內容，會發現注入的 `AppService` 變成我們指定的物件 `{ name: 'VIC' }`。

#### 非類別型 token

Provider 的 `token` 不一定要使用 `class`，Nest 允許使用以下項目：

- `string`
- `symbol`
- `enum`

同樣以 `app.module.ts` 為例：

```ts
@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'HANDSOME_MAN',
      useValue: 'VIC'
    }
  ],
})
export class AppModule {}
```

在注入的部分要使用 `@Inject(token?: string)` 裝飾器來取得，會發現注入的 `HANDSOME_MAN` 即為指定的值。

```ts
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('HANDSOME_MAN') private readonly handsome_man: string
  ) {
    console.log(this.handsome_man);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

>**提醒**：通常會把這類型的 `token` 名稱放在獨立的檔案裡，好處是當有其他地方需要使用的時候，可以直接取用該檔案裡的內容，而不需要再重寫一次 `token` 的名稱。

### Class Provider

讓 `token` 指定為抽象類別，並使用 `useClass` 來根據不同環境提供不同的實作類別。

```ts
class HandSomeMan {
  name = 'VIC';
}

class TestHandSomeMan {
  name = 'VIC';
}

@Module({
  imports: [TodoModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: TodoService,
      useClass: process.env.NODE_ENV === 'production' ? HandSomeMan : TestHandSomeMan
    }
  ],
})
export class AppModule {}
```

>**提醒**：如果沒有建立 `TodoService` 的話，先建立 `TodoModule` 並將其匯出；如果已經建立的話，也需要留意有沒有匯出呦。

稍微改寫一下 `app.controller.ts`：

```ts
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly todoService: TodoService
  ) {
    console.log(this.todoService);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

### Factory Provider

使用工廠模式讓 Provider 更加靈活，透過 **注入其他依賴** 來變化出不同的實例。用 `useFactory` 來指定工廠模式的函數，並透過 `inject` 來注入其他依賴。以 `app.module.ts` 為例：

```ts
class MessageBox {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'MESSAGE_BOX',
      useFactory: (appService: AppService) => {
        const message = appService.getHello();
        return new MessageBox(message);
      },
      inject: [AppService]
    }
  ],
})
export class AppModule {}
```

稍微改寫一下 `app.controller.ts`：

```ts
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('MESSAGE_BOX') private readonly messageBox
  ) {
    console.log(this.messageBox);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

## Alias Provider

替已經存在的 Provider 取別名，使用 `useExist` 來指定要使用哪個 Provider。以 `app.module.ts` 為例：

```ts
@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ALIAS_APP_SERVICE',
      useExisting: AppService
    }
  ],
})
export class AppModule {}
```

這樣就會把 `ALIAS_APP_SERVICE` 指向到 AppService 的實例。

## 依賴注入 Dependency Injection

依賴注入是一種設計方法，透過此方式可以大幅降低耦合度，來個簡單的例子吧，假設有兩個 `class` 分別叫 `Computer` 與 `CPU`：

```ts
class CPU {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Computer {
  cpu: CPU;
  constructor(cpu: CPU) {
    this.cpu = cpu;
  }
}
```

可以看到 `Computer` 在建構的時候需要帶入類別為 `CPU` 的參數，這樣的好處是把 `CPU` 的功能都歸在 `CPU` 裡、Computer 不需要實作 `CPU` 的功能，甚至抽換成不同 `CPU` 都十分方便：

```ts
const i7 = new CPU('i7-11375H');
const i9 = new CPU('i9-10885H');
const PC1 = new Computer(i7);
const PC2 = new Computer(i9);
```

### Nest 的依賴注入機制

在 Controller 的 `constructor` 注入了 Service 後，沒有使用到 `new` 卻可以直接使用。是因為當 Module 建立起來的同時，會把 providers 裡面的項目實例化，而我們注入的 Service 就是透過這樣的方式建立實例的，也就是說有個機制在維護這些實例，這個機制叫 **控制反轉容器 (IoC Container)**。

控制反轉容器是透過 `token` 來找出對應項目的，類似 `key/value` 的概念，例如把 `app.module.ts` 內 `@Module` 的 `providers` 配置參數展開：

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    { provide: AppService, useClass: AppService }
  ],
})
export class AppModule {}
```

物件的 `provide` 即 `token`，`useClass` 則是指定使用的 `class` 為何，進而建立實例。
