# File Upload

- [使用 multer](#使用-multer)
  - [單一檔案上傳](#單一檔案上傳)
  - [單一欄位之多個檔案上傳](#單一欄位之多個檔案上傳)
  - [多欄位之多個檔案上傳](#多欄位之多個檔案上傳)
  - [不分欄位之多個檔案上傳](#不分欄位之多個檔案上傳)
- [預設 multer 設置](#預設-multer-設置)
- [實作檔案儲存](#實作檔案儲存)

Nest 針對檔案上傳功能封裝了一套名為 [multer](https://github.com/expressjs/multer) 的套件，它 (只) 會處理格式為 `multipart/form-data` 的資料，在 Express 的應用程式上經常可以看到它的身影，是非常知名的套件。

## 使用 multer

Nest 已將其包裝成內建模組，但還是建議安裝 multer 的型別定義檔：

```bash
npm install -D @types/multer
```

### 單一檔案上傳

在特定路由下使用 `FileInterceptor` 並透過參數裝飾器 `@UploadedFile` 來取得檔案。其中，`FileInterceptor` 有兩個參數可以帶入，分別是：

1. `fieldName`：檔案在表單上對應的名稱。
2. `options`：對應到 MulterOption，詳細內容可以參考 multer [DOC](https://github.com/expressjs/multer#multeropts)。

以 `app.controller.ts` 為例來實作單一檔案上傳：

```ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  @Post('/single')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    return file;
  }
}
```

### 單一欄位之多個檔案上傳

同一個欄位名稱有一個以上的檔案，要使用 `FilesInterceptor` 並透過參數裝飾器 `@UploadedFiles` 來取得一個包含多個 `Express.Multer.File` 型別的陣列。

>**注意**：這裡是使用複數 **Files** 而不是單一檔案上傳所使用的 `FileInterceptor` 與 `@UploadedFile`。

`FilesInterceptor` 有三個參數可以帶入：

1. `fieldName`：檔案在表單上對應的名稱。
1. `maxCount`：配置可接受檔案數量的上限，可以選擇性填入。
1. `options`：對應到 `MulterOption`。

```ts
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  @Post('/multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(({ fieldname, originalname }) => ({ fieldname, originalname }));
  }
}
```

### 多欄位之多個檔案上傳

假如表單有多個欄位並且有一個以上的欄位包含檔案，要使用 `FileFieldsInterceptor` 並透過 `@UploadedFiles` 裝飾器來取得一個以欄位名稱作為 `key` 的物件，其值為 `Express.Multer.File` 型別的陣列。其中，`FileFieldsInterceptor` 有兩個參數可以帶入：

1. `uploadedFields`：一個包含多個物件的陣列，物件需要擁有 `name` 屬性來指定欄位的名稱，亦可以給定 `maxCount` 來指定該欄位可接受的檔案數量上限。
1. `options`：對應到 `MulterOption`。

```ts
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  @Post('/multiple')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'first' }, // 欄位一
    { name: 'second' } // 欄位二
  ]))
  uploadMultipleFiles(@UploadedFiles() files: { [x: string]: Express.Multer.File[] }) {
    const { first, second } = files;
    const list = [...first, ...second];
    return list.map(({ fieldname, originalname }) => ({ fieldname, originalname }));
  }
}
```

### 不分欄位之多個檔案上傳

假如表單有多個欄位並且有一個以上的欄位包含檔案，但不需要依照欄位名稱做分類的話，可以直接使用 `AnyFilesInterceptor` 並透過 `@UploadedFiles` 裝飾器來取得一個包含多個 `Express.Multer.File` 型別的陣列。其中，`AnyFilesInterceptor` 可以帶入一個參數，即 `options`。

```ts
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  @Post('/multiple')
  @UseInterceptors(AnyFilesInterceptor())
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(({ fieldname, originalname }) => ({ fieldname, originalname }));
  }
}
```

## 預設 multer 設置

上面每個功能都可以指定 `MulterOption` 的配置，假如有個配置是多數上傳檔案都會用到的，那每次都要個別配置實在太麻煩了，所以 Nest 有提供一個 `MulterModule`，只要調用 `register` 方法即可，該方法可接受之參數正是 `MulterOption`。

假如我們希望把上傳的檔案存到名為 `upload` 的資料夾裡，那就在 `register` 裡面給定 `dest` 屬性，並指定其值為 `./upload`：

```ts
// ...
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload'
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 實作檔案儲存

沿用「預設 multer 設置」與「不分欄位之多個檔案上傳」的範例進行測試，會發現 multer 預設情況下會對儲存的檔案隨機命名避免檔名衝突，這時候可以用 multer 提供的 `diskStorage` 來輔助我們去處理檔案名稱的問題。

`diskStorage` 是一個函式，我們可以透過指定 `destination` 來配置檔案的存放位置、指定 `filename` 去處理檔案名稱，這兩個屬性的值皆為 **函式**，透過函式去處理的彈性比較大，畢竟給特定值並不適用在每個場景。

透過撰寫一個 Helper Class 來實作這兩個函式，添加 `multer.helper.ts`，`destination`、`filename` 所需的函式有特定的參數，其包含了 `Request`、`Express.Multer.File` 以及 `(error: Error | null, destination: string) => void` 的 Callback 函式，透過該 Callback 將處理好的結果返回給 multer：

```ts
import { Request } from 'express';
import { resolve } from 'path';

export class MulterHelper {
  public static destination(
    request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ): void {
    callback(null, resolve(__dirname, '../upload/'));
  }
  public static filenameHandler(
    request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ): void {
    const { originalname } = file;
    const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, `${uniquePreffix}-${originalname}`);
  }
}
```

修改 `app.module.ts` 的內容，實裝這兩個函式：

```ts
// ...
import { diskStorage } from 'multer';
import { MulterHelper } from './core/helpers/multer.helper';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: MulterHelper.destination,
        filename: MulterHelper.filenameHandler
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
