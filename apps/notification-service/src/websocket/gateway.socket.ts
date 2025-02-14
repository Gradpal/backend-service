import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { _401, _404 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';

@WebSocketGateway({
  cors: true,
  namespace: '/',
  transport: ['websocket', 'polling'],
})
export class WebSocketGatewayHandler
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;
  private readonly logger = new Logger(WebSocketGateway.name);
  private userSocketsMap = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  getServer(): Server {
    return this.server;
  }

  getUserSocketsMap(): Map<string, string[]> {
    return this.userSocketsMap;
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.debug(`New connection attempt: ${client.id}`);
      const userId = await this.authenticateClient(client);
      await this.registerClientConnection(userId, client);
      this.logger.log(`Client ${client.id} authenticated for user ${userId}`);
    } catch (error) {
      this.logger.error('Connection failed:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = await this.authenticateClient(client);
      this.unregisterClientConnection(userId, client.id);
      this.logger.log(`Client ${client.id} disconnected`);
    } catch (error) {
      this.logger.error('Disconnect handling failed:', error.message);
    }
  }

  private async authenticateClient(client: Socket): Promise<string> {
    const token = this.extractToken(client);
    const payload = this.jwtService.verify(token, {
      secret: 'secret',
    });
    return payload.id;
  }

  private extractToken(client: Socket): string {
    const authHeader = client.handshake.headers?.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      this.exceptionHandler.throwUnauthorized(_401.AUTH_INVALID_TOKEN);
    }
    return authHeader.split(' ')[1];
  }

  private async registerClientConnection(userId: string, client: Socket) {
    const existingSockets = this.userSocketsMap.get(userId) || [];
    this.userSocketsMap.set(userId, [...existingSockets, client.id]);
    await client.join(`user_${userId}`);
  }

  private unregisterClientConnection(userId: string, socketId: string) {
    const existingSockets = this.userSocketsMap.get(userId) || [];
    this.userSocketsMap.set(
      userId,
      existingSockets.filter((id) => id !== socketId),
    );
  }
}
