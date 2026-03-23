import {Module} from '@nestjs/common';
import {TasksController} from './tasks.controller';
import {TasksService} from './tasks.service';
import {AiModule} from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
