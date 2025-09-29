import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { AgentSchoolsController } from './agent-schools.controller';
import { SchoolsService } from './schools.service';
import { SchoolCodeGeneratorService } from './school-code-generator.service';

@Module({
  controllers: [SchoolsController, AgentSchoolsController],
  providers: [SchoolsService, SchoolCodeGeneratorService],
  exports: [SchoolsService, SchoolCodeGeneratorService],
})
export class SchoolsModule {}
