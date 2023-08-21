# Module Reference

Nest 有提供另一種不同的方式來取得內部 Provider 的實例，它叫 **模組參照 (Module Reference)**。

它是一個名叫 `ModuleRef` 的 `class`，可以對內部 Provider 做一些存取，可以說是該 Module 的 Provider 管理器。

## 使用 Module Reference

使用上與 Provider 注入的方式相同，在 `constructor` 注入即可：

```ts
// ...
import { ModuleRef } from '@nestjs/core';

@Controller()
export class AppController {
  constructor(
    private readonly moduleRef: ModuleRef
  ) {}
}
```

### 獲取實例

透過 `ModuleRef.get()` 方法可以取得 **當前 Module** 下的 **任何元件**，如：Controller、Service、Guard 等。

>**注意**：此方法無法在非預設作用域的配置下使用。