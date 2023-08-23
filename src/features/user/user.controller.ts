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
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO, UpdateUserDTO } from 'src/common/models/user.model';
import { MailerService } from 'src/common/mailer/mailer.service';

@Controller('users')
@UsePipes(ValidationPipe)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  @Post()
  create(@Body() body: UserDTO) {
    return this.userService.create(body);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  updateById(@Param('id') id: string, @Body() body: UpdateUserDTO) {
    return this.userService.updateById(id, body);
  }

  @Delete(':id')
  removeById(@Param('id') id: string) {
    return this.userService.removeById(id);
  }

  @Post('mail')
  senddmail(@Body() body: any) {
    const { to, subject, text, html } = body;
    return this.mailerService.sendMail(to, subject, text, html);
  }
}
