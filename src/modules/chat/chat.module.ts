import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../config/database.module';
import { ChatService } from './chat.service';
import { ChatAIService } from './chat-ai.service';
import { ChatRiskAnalysisService } from './chat-risk-analysis.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ChatService, ChatAIService, ChatRiskAnalysisService],
  controllers: [ChatController],
  exports: [ChatService, ChatAIService, ChatRiskAnalysisService],
})
export class ChatModule {}
