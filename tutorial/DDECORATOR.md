# Decorator

**裝飾器 (Decorator)** 是一種設計模式，有些程式語言會直接將此設計模式實作出來，TS 與 JS 在近年也添加了此功能，而 Nest 將裝飾器發揮到淋漓盡致，透過裝飾器就可以很輕易地套用功能，不論是針對開發速度、易讀性等都很有幫助。

![Decorator](./imgs/d1.png)

## Custom Decorator

Nest 提供了 **自訂裝飾器 (Custom Decorator)** 的功能，其分成下方三種：

### 參數裝飾器

有些資料可能無法透過內建裝飾器直接取得，必須透過 `@Request` 裝飾器先取得請求物件，再從請求物件中提取，這樣的方式並不是特別理想，於是可以自行設計參數裝飾器來取得，而 Decorator 可以透過 CLI 產生：

```bash
nest generate decorator <DECORATOR_NAME>
```

建立出來的裝飾器是一個回傳 `SetMetadata` 的函式：

```ts
import { SetMetadata } from '@nestjs/common';

export const User = (...args: string[]) => SetMetadata('user', args);
```

不過參數裝飾器並不是使用 `SetMetadata`，而是透過 `createParamDecorator` 來產生參數裝飾器，並使用 Callback 裡面的 `ExecutionContext` 來取得請求物件再從中取得要取出的資料。下方為修改後的 `user.decorator.ts`：

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```
