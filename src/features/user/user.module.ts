import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from 'src/common/models/user.model';
import { MailerService } from 'src/common/mailer/mailer.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          UserSchema.pre('save', function (this: UserDocument, next) {
            console.log(this);
            next();
          });
          return UserSchema;
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, MailerService],
})
export class UserModule {}
