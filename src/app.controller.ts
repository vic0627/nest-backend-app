/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { HelloWorldInterceptor } from './interceptors/hello-world/hello-world.interceptor';
import { User } from './decorators/user/user.decorator';
// import { ParseIntPipe } from './pipes/parse-int/parse-int.pipe';
// import { RoleGuard } from './guards/role/role.guard';
// import { Roles } from './decorators/roles/roles.decorator';
import { Auth } from './decorators/auth/auth.decorator';

@Controller()
@UseInterceptors(HelloWorldInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Auth('staff')
  @Get()
  getHello(@User() user: any): any {
    return user;
  }

  // @Get(':id')
  // getUser(@Param('id', ParseIntPipe) id: number) {
  //   return { id, name: 'Vic' };
  // }
}
