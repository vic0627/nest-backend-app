# Authentication (Passport.js, passport-local)

- [passport 介紹](#passport-介紹)
- [安裝 passport](#安裝-passport)
- [實作帳戶註冊](#實作帳戶註冊)
  - [定義 Schema](#定義-schema)
  - [鹽加密](#鹽加密)
  - [模組設計](#模組設計)
    - [使用者模組](#使用者模組)
    - [驗證模組](#驗證模組)
  - [實作本地帳戶登入](#實作本地帳戶登入)
    - [實作策略](#實作策略)
    - [使用 AuthGuard](#使用-authguard)

一個應用程式可能會有非常多種的註冊方式，每一種方式都有一套自己的 **策略(Strategy)**，所以管理各種 **帳戶驗證(Authentication)** 的策略也是非常重要。

node.js 圈子中，最熱門的帳戶驗證管理工具 [Passport.js](http://www.passportjs.org/) (簡稱：`passport`)，Nest 也有將其包裝成模組，名稱為 `PassportModule`。

## passport 介紹

`passport` 採用了 **策略模式** 來管理各種驗證方式，它主要由兩個部分構成整個帳戶驗證程序，分別為：`passport` 與 `passport strategy`。

`passport` 本身是用來處理 **驗證流程** 的，而 `passport strategy` 則是 **驗證機制**，兩者缺一不可，整個 `passport` 生態系有上百種的驗證機制讓開發人員使用，如：facebook 驗證策略、google 驗證策略、本地驗證策略等，完美解決各種驗證機制的處理。

![a1](./imgs/a1.png)

在 Nest 中，`passport strategy` 會與 Guard 進行搭配，透過 `AuthGuard` 將 `strategy` 包裝起來，就可以透過 Nest 的 Guard 機制來與 `passport` 做完美的搭配。

![a2](./imgs/a2.png)

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

### 鹽加密

![a3](./imgs/a3.png)

鹽加密的概念是將 **輸入值(input)** 與 **某個特定的值(salt)** 進行加密，最後會得出一個 **結果(hash)**。

在 `src/core/utils` 下新增一個 `common.utility.ts` 檔案，並設計一個靜態方法 `encryptBySalt`，它有兩個參數：`input` 與 `salt`，其中，`salt` 的預設值為 `randomBytes` 計算出來的值，而 `input` 與 `salt` 透過 `pbkdf2Sync` 進行 SHA-256 加密並迭代 1000 次，最終返回 `hash` 與 `salt`：

```ts
import { randomBytes, pbkdf2Sync } from 'crypto';

export class CommonUtility {
  public static encryptBySalt(
    input: string,
    salt = randomBytes(16).toString('hex'),
  ) {
    const hash = pbkdf2Sync(input, salt, 1000, 64, 'sha256').toString('hex');
    return { hash, salt };
  }
}
```

### 模組設計

這邊會需要建立兩個模組：`UserModule` 與 `AuthModule`，`UserModule` 是用來處理與使用者相關的操作，而 `AuthModule` 則是處理與身分驗證有關的操作，基本上 `AuthModule` 必定與 `UserModule` 產生依賴，因為要有使用者才有辦法做身分驗證。

#### 使用者模組

`UserModule` 因為要對使用者資料進行操作，需要使用 `MongooseModule` 來建立 `model`，又因為 `AuthModule` 會依賴於 `UserModule` 去操作使用者資料，故我們要將 `UserService` 匯出讓 `AuthModule` 可以透過 `UserService` 去操作使用者資料：

```ts
// ...
import { MongooseModule } from '@nestjs/mongoose';
import { UserDefinition } from '../../common/models/user.model';

@Module({
  imports: [MongooseModule.forFeature([UserDefinition])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

設計一個 DTO 來給定參數型別與進行簡單的資料驗證，新增 `create-user.dto.ts`：

```ts
export class CreateUserDto {
  @MinLength(6)
  @MaxLength(16)
  public readonly username: string;

  @MinLength(8)
  @MaxLength(20)
  public readonly password: string;

  @IsNotEmpty()
  public readonly email: string;
}
```

在 `AppModule` 透過依賴注入的方式來啟用 `ValidationPipe`：

```ts
// ...
import { APP_PIPE } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [MongoConfigFactory],
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { // 注入全域 Pipe
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

最後在 `UserService` 注入 `model` 並設計 `createUser(user: CreateUserDto)` 方法來建立使用者，其中，`password` 需要透過鹽加密來處理：

```ts
@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_MODEL_TOKEN)
    private readonly userModel: Model<UserDocument>,
  ) {}

  createUser(user: CreateUserDto) {
    const { username, email } = user;
    const password = CommonUtility.encryptBySalt(user.password);
    return this.userModel.create({
      username,
      email,
      password,
    });
  }
}
```

#### 驗證模組

透過 CLI 在 `src/features` 下產生 `AuthModule` 與 `AuthController`：

```text
nest generate module features/auth
nest generate controller features/auth
```

在 `AuthModule` 中匯入 `UserModule`：

```ts
@Module({
  imports: [UserModule],
  controllers: [AuthController],
})
export class AuthModule {}
```

接著，在 `AuthController` 設計一個 `[POST] /auth/signup` 的 API，並調用 `UserService` 的 `createUser(user: CreateUserDto)` 方法來建立使用者：

```ts
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  signup(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }
}
```

### 實作本地帳戶登入

在登入的過程中，會進行一些帳號密碼的檢測，檢測通過之後便完成登入程序。本地帳戶登入可以使用 `passport-local` 這個 `strategy` 與 `passport` 進行搭配，透過 `npm` 進行安裝即可：

```text
npm install passport-local
npm install @types/passport-local -D
```

#### 實作策略

在 `UserService` 添加一個 `findUser` 方法來取得使用者資料，用途是讓使用者輸入 `email` 與 `password` 後，可以去資料庫中尋找對應的使用者：

```ts
@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_MODEL_TOKEN)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ...

  async findUser(filter: FilterQuery<UserDocument>) {
    return await this.userModel.findOne(filter);
  }
}
```

透過 CLI 產生 `AuthService` 來處理檢測帳戶的工作：

```text
nest generate service features/auth
```

在 `AuthService` 設計一個 `validateUser(username: string, password: string)` 的方法，先透過 `username` 尋找對應的使用者資料，再針對使用者輸入的密碼與 `salt` 進行鹽加密，如果結果與資料庫中的 `hash` 相同，就回傳使用者資料，否則回傳 `null`：

```ts
@Injectable()
export class AuthService {

  constructor(private readonly userService: UserService) {}
  
  async validateUser(username: string, password: string) {
    const user = await this.userService.findUser({ username });
    const { hash } = CommonUtility.encryptBySalt(password, user?.password?.salt);
    if (!user || hash !== user?.password?.hash) {
      return null;
    }
    return user;
  }

}
```

完成了使用者驗證的方法後，需要建立一個 Provider 來作為 `strategy`，將驗證方法與 `passport` 的機制接上。

建立 `local.strategy.ts`，在這個檔案中實作一個 `LocalStrategy` 的 `class`，需特別注意的是該 `class` 要繼承 `passport-local` 的 `strategy`，但需要透過 Nest 製作的 `function` 來與它做串接，並實作 `validate(username: string, password: string)` 方法，該方法即為 `passport` 流程的 **進入點**，在這裡我們就用呼叫剛剛在 `AuthService` 實作的方法來進行帳號驗證：

```ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: Email, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { username: user.username, email: user.email };
  }

}
```

>**提醒**：`passport-local` 預設是以 `username`、`password` 兩個欄位進行驗證，如果需要取代欄位名稱，例如 `username` 換成 `email`，需要在 `super()` 內傳遞 `{ usernameField: 'email' }`。

在 `AuthModule` 匯入 `PassportModule` 與在 `providers` 裡面添加 `LocalStrategy`：

```ts
@Module({
  imports: [PassportModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
```

#### 使用 AuthGuard

實作一個 API 來處理登入驗證，在 `AuthController` 添加一個 `signin` 方法並套用 `AuthGuard`，因為是使用 `passport-local` 這個 `strategy`，所以要在 `AuthGuard` 帶入 `local` 這個字串，`passport` 會自動與 `LocalStrategy` 進行串接，然後 `passport` 會將 `LocalStrategy` 中 `validate` 方法回傳的值寫入 **請求物件** 的 `user` 屬性中，這樣就可以在 Controller 中使用該使用者的資訊：

```ts
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  //...

  @UseGuards(AuthGuard('local'))
  @Post('/signin')
  signin(@Req() request: Request) {
      return request.user;
  }
}
```
