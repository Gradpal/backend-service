import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { CoreServiceConfigModule } from '@core-service/configs/core-service-config.module';
import { UserModule } from '../user/user.module';
import { TutorModule } from '../tutor/tutor.module';
import { StudentModule } from '../student/student.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tutor } from '../tutor/entities/tutor.entity';
import { Student } from '../student/entities/student.entity';
import { User } from '../user/entities/user.entity';
import { PaymentModule } from '../payment/payment.module';
import { PaymentService } from '../payment/payment.service';
import { Payment } from '../payment/entities/payment.entity';

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
    TutorModule,
    StudentModule,
    TypeOrmModule.forFeature([Tutor, Student, Payment,User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    PaymentService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
