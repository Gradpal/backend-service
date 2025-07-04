import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { CreateMessageDto } from './dtos/create-message.dto';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(createConversationDto);
  }

  @Post('messages/:conversationId')
  @UseInterceptors(FilesInterceptor('sharedFiles', 2))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMessageDto })
  async createMessage(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles() sharedFiles: Express.Multer.File[],
  ) {
    return this.chatService.createMessage(
      conversationId,
      createMessageDto,
      sharedFiles,
    );
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Get('conversations/:conversationId')
  async getConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.getConversation(conversationId);
  }

  @Get('messages/:messageId')
  async getMessage(@Param('messageId') messageId: string) {
    return this.chatService.getMessage(messageId);
  }

  @Patch('messages/:messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: CreateMessageDto,
  ) {
    return this.chatService.updateMessage(messageId, updateMessageDto);
  }

  @Delete('messages/:messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(messageId);
  }

  @Delete('conversations/:conversationId')
  async deleteConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.deleteConversation(conversationId);
  }

  @Patch('conversations/:conversationId')
  async updateConversation(
    @Param('conversationId') conversationId: string,
    @Body() updateConversationDto: CreateConversationDto,
  ) {
    return this.chatService.updateConversation(
      conversationId,
      updateConversationDto,
    );
  }
  @Patch('messages/:messageId/read')
  async markMessageAsRead(@Param('messageId') messageId: string) {
    return this.chatService.markMessageAsRead(messageId);
  }

  @Patch('conversations/:conversationId/messages/read')
  async markAllMessagesAsRead(@Param('conversationId') conversationId: string) {
    return this.chatService.markAllMessagesAsRead(conversationId);
  }

  @Patch('conversations/:conversationId/archive')
  async archiveConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.archiveConversation(conversationId);
  }

  @Patch('conversations/:conversationId/unarchive')
  async unarchiveConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.unarchiveConversation(conversationId);
  }

  @Patch('conversations/:conversationId/block')
  async blockConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.blockConversation(conversationId);
  }

  @Patch('conversations/:conversationId/unblock')
  async unblockConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.unblockConversation(conversationId);
  }

  @Get('conversations')
  @ApiQuery({ name: 'userId', type: String })
  async getConversations(@Query('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }
}
