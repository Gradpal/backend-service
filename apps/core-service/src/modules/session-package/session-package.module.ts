import { forwardRef, Module } from '@nestjs/common';
import { SessionPackageController } from './session-package.controller';
import { SessionPackageService } from './session-package.service';
import { ClassSessionModule } from './class-session/class-session.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionPackage } from './entities/session-package.entity';
import { PackageType } from './entities/package-type.entity';
import { ClassSession } from './class-session/entities/class-session.entity';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { BrainModule } from '@app/common/brain/brain.module';
import { UserModule } from '../user/user.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { CoreServiceConfigModule } from '@core-service/configs/core-service-config.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { PackageOffering } from './entities/package-offering.entity';
import { TimeSlot } from '../portfolio/weekly-availability/entities/weeky-availability.entity';
@Module({
  imports: [
    ClassSessionModule,
    TypeOrmModule.forFeature([
      SessionPackage,
      PackageType,
      ClassSession,
      PackageOffering,
      TimeSlot,
    ]),
    MinioClientModule,
    BrainModule,

    forwardRef(() => UserModule),
    forwardRef(() => SubjectsModule),
    CoreServiceConfigModule,
    forwardRef(() => PortfolioModule),
  ],
  controllers: [SessionPackageController],
  providers: [SessionPackageService],
  exports: [SessionPackageService],
})
export class SessionPackageModule {}
