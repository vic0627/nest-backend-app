# Authentication JWT

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

