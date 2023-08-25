import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO, UpdateUserDTO } from 'src/common/models/user.model';
import { MailerService } from 'src/common/mailer/mailer.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UsePipes(ValidationPipe)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  // @Post()
  // create(@Body() body: UserDTO) {
  //   return this.userService.create(body);
  // }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
  // findById(@Param('id') id: string) {
  //   return this.userService.findById(id);
  // }

  // @Patch(':id')
  // updateById(@Param('id') id: string, @Body() body: UpdateUserDTO) {
  //   return this.userService.updateById(id, body);
  // }

  // @Delete(':id')
  // removeById(@Param('id') id: string) {
  //   return this.userService.removeById(id);
  // }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findUser({ _id: id });
    const { password, ...others } = user.toJSON();
    return others;
  }
}
