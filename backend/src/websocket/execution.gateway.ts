import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
  namespace: '/ws',
})
export class ExecutionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ExecutionGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:execution')
  handleSubscribe(
    @MessageBody() data: { executionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`execution:${data.executionId}`);
    return { event: 'subscribed', data: { executionId: data.executionId } };
  }

  @SubscribeMessage('unsubscribe:execution')
  handleUnsubscribe(
    @MessageBody() data: { executionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`execution:${data.executionId}`);
    return { event: 'unsubscribed', data: { executionId: data.executionId } };
  }

  @OnEvent('execution.execution:started')
  handleExecutionStarted(payload: any) {
    this.server.to(`execution:${payload.executionId}`).emit('execution:started', payload);
  }

  @OnEvent('execution.execution:completed')
  handleExecutionCompleted(payload: any) {
    this.server.to(`execution:${payload.executionId}`).emit('execution:completed', payload);
  }

  @OnEvent('execution.execution:failed')
  handleExecutionFailed(payload: any) {
    this.server.to(`execution:${payload.executionId}`).emit('execution:failed', payload);
  }

  @OnEvent('execution.agent:started')
  handleAgentStarted(payload: any) {
    this.server.to(`execution:${payload.executionId}`).emit('agent:started', payload);
  }

  @OnEvent('execution.agent:completed')
  handleAgentCompleted(payload: any) {
    this.server.to(`execution:${payload.executionId}`).emit('agent:completed', payload);
  }

  @OnEvent('execution.agent:failed')
  handleAgentFailed(payload: any) {
    this.server.to(`execution:${payload.executionId}`).emit('agent:failed', payload);
  }

  @OnEvent('execution.log')
  handleLog(payload: any) {
    this.server.to(`execution:${payload.executionId}`).emit('log', payload);
  }
}
