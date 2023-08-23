# Authentication

一個應用程式可能會有非常多種的註冊方式，每一種方式都有一套自己的 **策略(Strategy)**，所以管理各種 **帳戶驗證(Authentication)** 的策略也是非常重要。

node.js 圈子中，最熱門的帳戶驗證管理工具 [Passport.js](http://www.passportjs.org/) (簡稱：`passport`)，Nest 也有將其包裝成模組，名稱為 `PassportModule`。

## passport 介紹

`passport` 採用了 **策略模式** 來管理各種驗證方式，它主要由兩個部分構成整個帳戶驗證程序，分別為：`passport` 與 `passport strategy`。

`passport` 本身是用來處理 **驗證流程** 的，而 `passport strategy` 則是 **驗證機制**，兩者缺一不可，整個 `passport` 生態系有上百種的驗證機制讓開發人員使用，如：facebook 驗證策略、google 驗證策略、本地驗證策略等，完美解決各種驗證機制的處理。

![a1](./imgs/a1.pn)

在 Nest 中，`passport strategy` 會與 Guard 進行搭配，透過 `AuthGuard` 將 `strategy` 包裝起來，就可以透過 Nest 的 Guard 機制來與 `passport` 做完美的搭配。

![a2](./imgs/a2.pn)

## 安裝 passport

透過 `npm` 來安裝 `passport`，需要安裝 Nest 包裝的模組以及 `passport` 本身：

```text
npm install @nestjs/passport passport
```

## 實作帳戶註冊

開始實作之前，需要先設計一個帳戶註冊的 API。

### 定義 Schema

將使用者的 `Schema`、`Document`、`Schema` 實體，與 `ModelDefinition` 做定義：

```ts
import { ModelDefinition, Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {

  @Prop({
    required: true,
    minlength: 6,
    maxlength: 16
  })
  username: string;
  
  @Prop({
    required: true
  })
  email: string;

  @Prop({
    type: raw({
      hash: String,
      salt: String
    }),
    required: true
  })
  password: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const USER_MODEL_TOKEN = User.name;

export const UserDefinition: ModelDefinition = {
  name: USER_MODEL_TOKEN,
  schema: UserSchema,
};
```

共設計了三個欄位，分別為：`username`、`email` 與 `password`，其中，`password` 為巢狀結構，原因是我們不希望密碼直接儲存在資料庫裡面，而是透過密碼學中的**加鹽**來替密碼進行加密。

