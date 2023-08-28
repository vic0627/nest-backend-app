import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [UserModule],
  controllers: [ChatController],
  providers: [ChatService, AuthService, JwtService, ChatGateway],
})
export class ChatModule {}
