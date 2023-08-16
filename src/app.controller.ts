import { Controller, Get, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ParseIntPipe } from './pipes/parse-int/parse-int.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return { id, name: 'Vic' };
  }
}
