import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { CoreServiceConfigModule } from '@core-service/configs/core-service-config.module';
import { UserModule } from '../user/user.module';
import { PaymentService } from '../payment/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payment/entities/payment.entity';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { PaymentModule } from '../payment/payment.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [CoreServiceConfigModule],
      inject: [CoreServiceConfigService],
      useFactory: async (configService: CoreServiceConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiresIn,
        },
      }),
    }),
    UserModule,
    PortfolioModule,
    PaymentModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
