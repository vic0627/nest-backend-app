import {
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { HelloWorldInterceptor } from './interceptors/hello-world/hello-world.interceptor';
// import { ParseIntPipe } from './pipes/parse-int/parse-int.pipe';

@Controller()
@UseInterceptors(HelloWorldInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get(':id')
  // getUser(@Param('id', ParseIntPipe) id: number) {
  //   return { id, name: 'Vic' };
  // }
}
