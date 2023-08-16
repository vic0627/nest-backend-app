import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { HandsomeModule } from './handsome/handsome.module';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('HANDSOME_MAN') private readonly handsome_man: HandsomeModule,
  ) {
    console.log(handsome_man);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
