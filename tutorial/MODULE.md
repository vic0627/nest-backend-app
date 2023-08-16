# Module 模組

主要是把相同性質的功能包裝在一起，並依照各模組的需求來串接，整個 Nest App 必定有一個根模組，Nest 會從根模組架構整個應用。

>事實上，Module 的功能 不一定 要包含 Controller，它可以只是一個很單純的功能所包裝而成的模組，比如說：MongooseModule。

## 建置

所有的 Module 都必須使用 @Module 裝飾器來定義。可以用 NestCLI 快速生成 Module：

```bash
nest generate module <MODULE_NAME>
```

`<MODULE_NAME>.module.ts` 的內容如下：

```ts
import { Module } from '@nestjs/common';

@Module({
    controllers: [],
    providers: [],
    exports: [],
    imports: [],
})
export class YourModule {}
```

## 參數

`@Module` 裝飾器內有四種配置參數可以傳入：

- `controllers`：歸納在該 Module 下的 Controller 放在這裡。
- `providers`：會使用到的 Provider 放在這裡，例如 Service。
- `exports`：在這個 Module 下的部分 Provider 可能會在其他 Module 中使用，此時就可以把這些 Provider 放在這裡進行匯出。
- `imports`：將其他模組的 Provider 匯入。

## 功能模組 Feature Module

大多數的 Module 都屬於功能模組，也就是把相同性質的功能包裝在一起。

## 共享模組 Shared Module

Nest 中，預設情況下 Module 都是單例的，也就是說可以在各模組間共享同一個實例。

事實上，每一個 Module 都算是共享模組，只要遵照設計原則來使用，每個 Module 都具有高度的重用性，也就是「依照各模組的需求來串接」。

像 Service 這種 Provider 會在 Module 中建立一個實例，當其他模組需要使用該實例時，就可以透過匯出的方式與其他 Module 共享。

### 全域模組 Global Module

當有 Module 要與多數 Module 共用時，會一直在各 Module 進行匯入的動作，這時候可以透過提升 Module 為 全域模組，讓其他模組不需要匯入也能夠使用，只需要在 Module 上再添加一個 @Global 的裝飾器即可。

```ts
import { Module, Global } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

@Global()
@Module({
  controllers: [TodoController],
  providers: [TodoService],
  exports: [TodoService]
})
export class TodoModule {}
```

>**注意**：雖然可以透過提升為全域來減少匯入的次數，但非必要情況應少用，這樣才是好的設計準則。

## 常用模組 Common Module

這是一種設計技巧，Module 可以不含任何 Controller 與 Provider，只單純把匯入的 Module 再匯出，這樣的好處是可以把多個常用的 Module 集中在一起，其他 Module 要使用的話只需要匯入此 Module 就可以了。

```ts
@Module({
  imports: [
    AModule,
    BModule
  ],
  exports: [
    AModule,
    BModule
  ],
})
export class CommonModule {}
```
