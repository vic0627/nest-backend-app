import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(private readonly authService: AuthService) {}

  async getUserFromSocket(socket: Socket) {
    const auth_token = socket.handshake?.auth?.token;

    const user =
      await this.authService.getUserFromAuthenticationToken(auth_token);

    if (!user) throw new WsException('Invalid credentials.');

    return user;
  }
}
