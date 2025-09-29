import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentIdGeneratorService } from './student-id-generator.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, StudentIdGeneratorService],
  exports: [StudentsService, StudentIdGeneratorService],
})
export class StudentsModule {}