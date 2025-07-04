import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalDocument } from './entities/legal-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LegalDocument])],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
