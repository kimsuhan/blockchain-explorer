import { BlockDto } from '@/modules/viem/dto/block.dto';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4001, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class BlockGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(BlockGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized on port 4001');
    this.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { message: 'Successfully connected to block gateway' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Client ${client.id} subscribed to block updates`);
    client.emit('subscribed', { message: 'Subscribed to block updates' });
  }

  // 새 블록 알림을 모든 클라이언트에게 브로드캐스트
  broadcastNewBlock(blockData: BlockDto[]): void {
    this.logger.log(`Broadcasting new block`);
    this.server.emit('newBlock', blockData);
  }

  // 특정 클라이언트에게 메시지 전송
  sendToClient(clientId: string, event: string, data: any): void {
    this.server.to(clientId).emit(event, data);
  }
}
