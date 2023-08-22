# ConfigModule

- [安裝 ConfigModule](#安裝-configmodule)
- [使用 ConfigModule](#使用-configmodule)
  - [自訂 .env](#自訂-env)
  - [使用工廠函式](#使用工廠函式)
  - [使用工廠函式配置命名空間](#使用工廠函式配置命名空間)
  - [在 main.ts 中使用 ConfigService](#在-maints-中使用-configservice)
  - [環境變數檔之擴展變數](#環境變數檔之擴展變數)
  - [全域 ConfigModule](#全域-configmodule)

在 Nest 中，可以使用官方製作的 `ConfigModule` 來讀取並管理環境變數。

## 安裝 ConfigModule

該套件並不是內建的，需要額外安裝，透過 `npm` 進行安裝即可：

```bash
npm install @nestjs/config
```

## 使用 ConfigModule

`ConfigModule` 也是用動態模組概念設計的，只需在 `AppModule` 中調用它 `forRoot` 方法：

```ts
// ...
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

>**提醒**：理論上來說，`ConfigModule.forRoot()` 會直接讀取專案根目錄的 `.env`，但筆者實作時發現只讀取到系統環境變數，因此又在 `main.ts` 調用了 `dotenv.config()`。

修改 `app.controller.ts`，利用 `ConfigService.get()` 取得環境變數：

```ts
// ...
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    // 注入 `ConfigService`
    private readonly configService: ConfigService
  ) {}

  @Get()
  getHello() {
    // 根據參數(token)取得目標環境變數
    const username = this.configService.get('USERNAME');
    return { username };
  }
}
```

### 自訂 .env

`ConfigModule` 的 `forRoot` 靜態方法有提供 `envFilePath` 參數來配置指定的 `.env` 檔，`envFilePath` 接受兩種型別的參數 `string | string[]`，若值為陣列，會根據陣列索引排定優先權( `envFilePath[0]` 優先權最高)：

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['development.local.env', 'development.env']
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

### 使用工廠函式

相較於 `.env`，有些比較不敏感的資訊可以直接在工廠函式裡做配置。

在 `src` 資料夾下創建一個名為 `config` 的資料夾，並在裡面建立 `configuration.factory.ts`：

```ts
export default () => ({
  PORT: process.env.PORT || 3000
});
```

修改 `app.module.ts` 的內容，添加 `load` 參數：

```ts
// ...
import configurationFactory from './config/configuration.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['development.local.env', 'development.env'],
      load: [configurationFactory]
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

>**注意**：`load` 參數接受陣列是因為它可以使用多個工廠函式來處理環境變數。

修改 `app.controller.ts`：

```ts
// ...
@Get()
getHello() {
  const username = this.configService.get('USERNAME');
  const port = this.configService.get('PORT');
  return { username, port };
}
// ...
```

### 使用工廠函式配置命名空間

透過 `registerAs` 這個函式來指定其命名空間，第一個參數即命名空間，第二個參數為 Callback：

```ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD
}));
```

修改 `app.controller.ts`：

```ts
// ...
@Get()
getHello() {
  const database = this.configService.get('database'); // 會有 `host`、`password`
  const db_host = this.configService.get('database.host'); // 單獨取 `host`
  return { database, db_host };
}
// ...
```

### 在 main.ts 中使用 ConfigService

要使用 `.env` 裡的 `port` 作為啟動 Nest 的 `port`，就必須在 `main.ts` 使用 `INestApplication<any>.get()` 處理：

```ts
// ...
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // 取得 `ConfigService`
  const port = configService.get('port');
  await app.listen(port);
}
bootstrap();
```

### 環境變數檔之擴展變數

假設有兩個環境變數是存在依賴關係：

```text
APP_DOMAIN=example.com
APP_REDIRECT_URL=example.com/redirect_url
```

透過指定 `ConfigModule.forRoot()` 物件參數中的 `expandVariables` 為 `true` 來解析環境變數檔，讓環境變數檔像有變數宣告功能一樣，透過 `${...}` 來嵌入指定的環境變數。

```text
APP_DOMAIN=example.com
APP_REDIRECT_URL=${APP_DOMAIN}/redirect_url
```

修改 `app.module.ts`：

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['development.local.env', 'development.env'],
      load: [configurationFactory],
      expandVariables: true
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

### 全域 ConfigModule

配置 `isGlobal` 為 `true` 將其配置為全域模組，這樣就不需要在其他模組中引入 `ConfigModule`：

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['development.local.env', 'development.env'],
      load: [configurationFactory],
      expandVariables: true,
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```
