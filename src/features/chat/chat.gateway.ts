import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(socket: Socket) {
    const { name } = await this.chatService.getUserFromSocket(socket);
    console.log(`[io] ${name} has connected!`);
  }

  @SubscribeMessage('send_message')
  async listenForMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = await this.chatService.getUserFromSocket(socket);

    this.server.sockets.emit('receive_message', { message, user: user.name });
  }
}
