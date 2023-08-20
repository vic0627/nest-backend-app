# Dynamic Module

**動態模組(Dynamic Module)** 可以用很簡單的方式去客製化 Provider 的內容，使該 Module 的 Provider 動態化。

![Dynamic Module](./imgs/dm1.png)

## 設計 Dynamic Module

Dynamic Module 最常遇到的情境就是環境變數管理，原因是管理環境變數的邏輯通常是不變的，會變的部分僅僅是讀取環境變數的檔案路徑等，透過動態模組的機制成功將其抽離成共用元件，降低耦合度。

以下是運用動態組與 [dotenv](https://www.npmjs.com/package/dotenv) 實作的環境變數管理模組，名稱為 `ConfigurationModule`：

目標是讓 `ConfigurationModule` 提供一個靜態方法 `forRoot`，它可以接受一個包含 `key` 值為 `path` 的物件參數，`path` 即 `.env` 檔的相對路徑，透過 `forRoot` 將參數帶給 `ConfigurationService` 來處理 `.env` 的檔案並管理解析出來的變數。首先，透過 `npm` 安裝 `dotenv`：

```bash
npm install dotenv --save
```

透過 CLI 產生 `ConfigurationModule` 與 `ConfigurationService`：

```bash
nest generate module common/configuration
nest generate service common/configuration
```

接著替 `ConfigurationModule` 添加一個 `forRoot` 靜態方法，回傳的值即為 `DynamicModule`，而 `DynamicModule` 其實就是一個物件，與 `@Module` 裝飾器內的參數大致相同，不同的是必須要帶上 `module` 參數，其值為 `ConfigurationModule` 本身，另外，還有 `global` 參數可以使產生出來的 Module 變成全域：

```ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';

// 因為只使用動態模組，而沒有特別設計靜態模組的部分，所以淨空 `@Module` 的參數。
@Module({})
export class ConfigurationModule {

  static forRoot(): DynamicModule {
    return {
      providers: [ConfigurationService],
      module: ConfigurationModule,
      global: true
    };
  }

}
```

>**注意**：靜態方法可以自行設計，但回傳值必須為同步或非同步 `DynamicModule`，名稱通常會使用 `forRoot` 或 `register`。

接下來要在 `forRoot` 設計包含 `key` 值為 `path` 的物件參數，並將 `path` 取出，運用 Value Provider 的方式將該值記錄下來。先在 `configuration` 資料夾下新增 `constants` 資料夾，並在裡面建立 `token.const.ts` 來管理 `token`：

```ts
export const ENV_PATH = 'ENV_PATH';
```

調整 `configuration.module.ts`：

```ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ENV_PATH } from './constants/token.const';

// 並非靜態模組，拿掉 `@Module` 裝飾器所有參數。
@Module({})
export class ConfigurationModule {
    static forRoot(options: { path: string }): DynamicModule {
        return {
            providers: [
                {
                    provide: ENV_PATH,
                    useValue: options.path
                },
                ConfigurationService
            ],
            exports: [ConfigurationService],
            module: ConfigurationModule,
            global: true
        }
    }
}
```
