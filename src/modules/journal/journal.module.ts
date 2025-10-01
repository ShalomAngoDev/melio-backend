import { Module, forwardRef } from '@nestjs/common';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { AIAnalysisService } from './ai-analysis.service';
import { DatabaseModule } from '../../config/database.module';
import { ChatModule } from '../chat/chat.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [
    DatabaseModule,
    ChatModule,
    forwardRef(() => AchievementsModule), // V2: Pour la gamification
  ],
  controllers: [JournalController],
  providers: [JournalService, AIAnalysisService],
  exports: [JournalService, AIAnalysisService],
})
export class JournalModule {}
