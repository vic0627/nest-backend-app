import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata) {
    const integer = parseInt(value);

    if (isNaN(integer)) throw new NotAcceptableException('無法解析為數字');

    return integer;
  }
}
