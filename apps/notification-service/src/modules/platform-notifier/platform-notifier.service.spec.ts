import { Test, TestingModule } from '@nestjs/testing';
import { PlatformNotifierService } from './platform-notifier.service';
import { NotificationService } from '../notification/notification.service'; // Adjust the import path
import { WebSocketGatewayHandler } from '@notification-service/websocket/gateway.socket';

describe('PlatformNotifierService', () => {
  let service: PlatformNotifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PlatformNotifierService>(PlatformNotifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
