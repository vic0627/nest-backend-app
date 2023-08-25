import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserDefinition,
  UserDocument,
  UserSchema,
} from 'src/common/models/user.model';
import { MailerService } from 'src/common/mailer/mailer.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([UserDefinition])],
  controllers: [UserController],
  providers: [UserService, MailerService],
  exports: [UserService],
})
export class UserModule {}
