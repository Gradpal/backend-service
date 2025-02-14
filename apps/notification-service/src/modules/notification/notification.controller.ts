import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';
import { ApiQuery } from '@nestjs/swagger';

// TODO: Protect these endpoints so that they can only be accessed by authenticated users or Consider dispatching them to core-service through GRPC
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.notificationService.findById(id);
  }

  @Get('user/:userId/status')
  async getNotificationsByStatus(
    @Param('userId') userId: string,
    @Query('status') status: ENotificationStatus,
  ) {
    return await this.notificationService.getUserNotificationsByStatus(
      userId,
      status,
    );
  }

  @Get('user/:userId/status/paginated')
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit of notifications per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    description:
      'Sort direction (asc or desc) for the notifications based on updatedAt',
    type: String,
    example: 'desc',
  })
  async getUserNotificationsByStatusPaginated(
    @Param('userId') userId: string,
    @Query('status') status: ENotificationStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'desc',
  ) {
    return await this.notificationService.getUserNotificationsByStatusPaginated(
      userId,
      status,
      page,
      limit,
      sortDirection,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.notificationService.delete(id);
  }
}
