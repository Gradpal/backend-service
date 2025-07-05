import { Test, TestingModule } from '@nestjs/testing';
import { PlatformNotifierController } from './platform-notifier.controller';
import { PlatformNotifierService } from './platform-notifier.service';
import { NotificationService } from '../notification.service';
import { WebSocketGatewayHandler } from '@notification-service/websocket/gateway.socket';

describe('PlatformHandlerController', () => {
  let controller: PlatformNotifierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformNotifierController],
      providers: [
        PlatformNotifierService,
        {
          provide: NotificationService,
          useValue: {
            sendNotification: jest.fn(), // Mock the methods used in PlatformNotifierService
          },
        },
        {
          provide: WebSocketGatewayHandler,
          useValue: {
            handleEvent: jest.fn(), // Mock the methods used in PlatformNotifierService
          },
        },
      ],
    }).compile();

    controller = module.get<PlatformNotifierController>(
      PlatformNotifierController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
