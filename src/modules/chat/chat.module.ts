import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../config/database.module';
import { ChatService } from './chat.service';
import { ChatAIService } from './chat-ai.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ChatService, ChatAIService],
  controllers: [ChatController],
  exports: [ChatService, ChatAIService],
})
export class ChatModule {}