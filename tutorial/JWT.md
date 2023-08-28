# Authentication JWT

- [Token](#token)
- [Json Web Token (JWT)](#json-web-token-jwt)
  - [標頭 Header](#標頭-header)
  - [內容 Payload](#內容-payload)
  - [簽章 Verify Signature](#簽章-verify-signature)
- [安裝 JWT](#安裝-jwt)
- [實作 JWT 驗證](#實作-jwt-驗證)
  - [產生 JWT](#產生-jwt)
  - [驗證 JWT](#驗證-jwt)

一個完整的帳戶機制還需要包含 **登入後** 的身份識別，實作這樣的識別功能有很多種做法，**Token** 正是其中一個被廣泛運用的方案。

## Token

Token 是一個用來表示身份的媒介，使用者成功登入時，系統會產生出一個獨一無二的 Token，並將該 Token 返回給使用者，只要在 Token 有效的期間內，該使用者在請求中帶上該 Token，系統便會識別出此操作的使用者是誰。

![j1](./imgs/j1.png)

## Json Web Token (JWT)

[JWT](https://jwt.io/) 是一種較新的 Token 設計方法，它最大的特點是可以在 Token 中含有使用者資訊，不過僅限於較不敏感的內容，比如：使用者名稱、性別等，原因是 JWT 是用 Base64 進行編碼，使用者資訊可以透過 Base64 進行 **還原**，使用上需要特別留意。

JWT 格式：

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhBTyIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9.d704zBOIq6KNcexbkfBTS5snNa9tXz-RXo7Wi4Xf6RA
```

JWT 整個字串被兩個「.」切割成三段，這三段可以透過 Base64 進行解碼，它們各自有不同的內容：

### 標頭 Header

標頭為 JWT 第一段的部分，其內容包含「加密演算法」與「Token 類型」。上方 JWT 的標頭進行解碼可以得出下方資訊：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 內容 Payload

內容為 JWT 第二段的部分，這裡通常會放一些簡單的使用者資訊。上方 JWT 的內容進行解碼可以得出下方資訊：

```json
{
  "sub": "1234567890",
  "name": "HAO",
  "admin": true,
  "iat": 1516239022
}
```

### 簽章 Verify Signature

簽章為 JWT 第三段的部分，用來防止被竄改，在後端需要維護一組密鑰來替 JWT 進行簽章，密鑰需要妥善保存避免被有心人士獲取。

```ts
// 簽章第一部分由上面兩部分資訊組成
const metaData = base64UrlEncode(header) + "." + base64UrlEncode(payload);

// 簽章第二部分為自訂的環境變數
const your256BitSecret = process.env.JWT_SERECT

// 通過算法最終產生簽章
const signature = HMACSHA256(metaData, your256BitSecret)
```

## 安裝 JWT

先透過 `npm` 安裝 JWT 所需的套件，主要有 Nest 包裝的模組、[passport-jwt](https://www.npmjs.com/package/passport-jwt) 以及其型別定義檔：

```text
npm install @nestjs/jwt passport-jwt
npm install @types/passport-jwt -D
```

## 實作 JWT 驗證

先定義一組密鑰來進行 JWT 的簽章，並將該密鑰放至 `.env` 中：

```text
JWT_SECRET=YOUR_SECRET
```

將密鑰類型的環境變數整合至 `ConfigModule` 中的 `secrets` 底下：

```ts
export default registerAs('secrets', () => {
  const jwt = process.env.JWT_SECRET;
  return { jwt };
});
```

在 `app.module.ts` 中進行套用：

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [MongoConfigFactory, SecretConfigFactory], // 套用至 ConfigModule
      isGlobal: true
    }),
    // ...
  ],
  // ...
})
export class AppModule {}
```

### 產生 JWT

在處理驗證的 `AuthModule` 中匯入 `JwtModule`，並使用 `registerAsync` 方法來配置 JWT 的設定，最重要的就是將密鑰帶入：

```ts
@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get('secrets.jwt');
        return {
          secret,
          signOptions: {
            expiresIn: '60s'
          }
        };
      },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
```

為了讓使用者可以順利拿到它來使用會員功能，所以我們要在 `AuthService` 設計一個 `generateJwt` 方法來調用 `JwtService` 的 `sign` 方法產生 JWT，該方法需要帶入要放在「內容」區塊的資料，這裡我們就放入使用者的 `id` 與 `username`：

```ts
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  generateJwt(user: UserDocument) {
    const { _id: id, username } = user;
    const payload = { id, username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ...
}
```

最後就是在 `AuthController` 的 `signin` 方法回傳 `generateJwt` 的結果：

```ts
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('/signin')
  signin(@Req() request: Request) {
    return this.authService.generateJwt(request.user as UserDocument);
  }

  // ...
}
```

### 驗證 JWT

接下來我們要製作 `JwtStrategy` 與 `passport` 進行串接，跟 `LocalStrategy` 的實作方式大同小異，必須繼承 `passport-jwt` 的 `strategy`，比較不同的地方在於 `super` 帶入的參數。我們先在 `src/features/auth/strategies` 資料夾下新增 `jwt.strategy.ts`：

```ts
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(configService: ConfigService) {
    super({
      // 指定從請求中的哪裡提取 JWT，這裡可以使用 `ExtractJwt` 來輔助配置。
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 是否忽略過期的 JWT，預設是 `false`。
      ignoreExpiration: false,
      // 放入 JWT 簽章用的密鑰。
      secretOrKey: configService.get('secrets.jwt'),
    });
  }

  validate(payload: any) {
    const { id, username } = payload;
    return { id, username };
  }
}
```

>**注意**：更多的參數內容請參考 [官方文件](https://github.com/mikenicholson/passport-jwt#configure-strategy)。

`validate`：基本上 JWT 在流程上就已經驗證了其合法性與是否過期，故這裡 **可以不用** 進行額外的檢查，但如果要在這裡向資料庫提取更多的使用者資訊也是可以的。

完成 `JwtStrategy` 後記得要在 `AuthModule` 的 `providers` 裡面添加它：

```ts
@Module({
  // ...
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
```

修改一下 `user.controller.ts` 的內容，設計一個取得使用者資料的 API 來套用 JWT 驗證：

```ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findUser({ _id: id });
    const { password, ...others } = user.toJSON();
    return others;
  }
}
```

在 `getUser` 方法套用 `AuthGuard` 並指定使用 `jwt` 策略，將傳入的 `id` 向資料庫進行查詢，取得 `UserDocument` 後，先把它轉換成 JSON 格式，再透過解構的方式將 `password` 以外的屬性回傳到客戶端。

>**提醒**：透過 Postman 進行登入取得 `access_token` 時，需將其帶入 `Bearer token` 中來測試取得使用者資料的 API。
