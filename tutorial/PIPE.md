# Pipe

Pipe 經常被用來處理使用者傳入的參數，比如：驗證參數的正確性、型別的轉換等。

## Nest Pipe

在 Nest 中，Pipe 支援 Exception 的錯誤處理機制，當在 Pipe 拋出 Exception 時，該次請求就 不會 進入到 Controller 對應的方法裡，這樣的設計方法能夠有效隔離驗證程序與主執行程序，是非常好的實作方式。

Nest 內建了以下幾個 Pipe 來輔助資料轉型與驗證：

- `ValidationPipe`：驗證資料格式的 Pipe。
- `ParseIntPipe`：解析並驗證是否為 Integer 的 Pipe。
- `ParseBoolPipe`：解析並驗證是否為 Boolean 的 Pipe。
- `ParseArrayPipe`：解析並驗證是否為 Array 的 Pipe。
- `ParseUUIDPipe`：解析並驗證是否為 UUID 格式的 Pipe。
- `DefaultValuePipe`：驗證資料格式的 Pipe。

### 使用 Pipe

假設要解析並驗證路由參數是否為 `Integer` 的話，只需要在 `@Param` 裝飾器填入路由參數名稱並帶入 `ParseIntPipe` 即可。

以 `app.controller.ts` 為例，如果 `id` 解析後為數字，就會透過 `AppService` 去取得對應的 User 資訊，否則會拋出 Exception：

```ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.appService.getUser(id);
  }

}
```

#### 內建 Pipe 自訂 HttpCode

假設想要更改錯誤訊息，那 `ParseIntPipe` 就必須實例化並帶入相關參數，以 `app.controller.ts` 為例，我希望出錯時收到的 HttpCode 是 `406`：

```ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':id')
  getUser(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number
  ) {
    return this.appService.getUser(id);
  }

}
```

#### 內建 Pipe 自訂 Exception

如果想要自訂錯誤訊息的話，可以使用 `exceptionFactory` 這個參數來指定產生的 Exception。以 `app.controller.ts` 為例：

```ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':id')
  getUser(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => new NotAcceptableException('無法解析為數字')
      })
    )
    id: number
  ) {
    return this.appService.getUser(id);
  }

}
```

### 自訂 Pipe

Pipe 就是一個帶有 `@Injectable` 的 class，不過它要去實作 `PipeTransform` 這個介面。Pipe 可以透過 CLI 產生：

```bash
nest generate pipe <PIPE_NAME>
```

下方為 Pipe 的骨架，會看到有一個 `transform(value: any, metadata: ArgumentMetadata)` 方法，這就是要做邏輯判斷的地方，其中，`value` 為傳進來的值，`metadata` 為當前正在處理的參數元數據：

```ts
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```

>**注意**：`PipeTransform` 後面可以添加兩個 Type，第一個為 `T`，定義傳入的值應該為何種型別，也就是 `transform` 裡面的 `value`，第二個為 `R`，定義回傳的資料型別。

這裡我們調整一下 `parse-int.pipe.ts`，經過 `parseInt` 之後的 `value` 是否為 `NaN`，如果是則會拋出 `NotAcceptableException`：

```ts
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata) {
    const integer = parseInt(value);
    if ( isNaN(integer) ) {
      throw new NotAcceptableException('無法解析為數字');
    }
    return integer;
  }
}
```

接著去修改 `app.controller.ts`，來套用看看自己設計的 `ParseIntPipe`：

```ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':id')
  getUser(
    @Param('id', ParseIntPipe) id: number
  ) {
    return { id }
  }

}
```

透過瀏覽器查看 `http://localhost:3000/asd` 會得到下方結果：

```json
{
  "statusCode": 406,
  "message": "無法解析為數字",
  "error": "Not Acceptable"
}
```
