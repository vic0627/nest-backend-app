/* eslint-disable prettier/prettier */
import { Request } from 'express';
import { resolve } from 'path';

export class MulterHelper {
  public static destination(
    request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void,
  ): void {
    callback(null, resolve(__dirname, '../../upload'));
  }

  public static filenameHandler(
    request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void,
  ): void {
    const { originalname } = file;
    const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `${uniquePreffix}-${originalname}`);
  }
}
