import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  providers: [AdminService, PrismaService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
