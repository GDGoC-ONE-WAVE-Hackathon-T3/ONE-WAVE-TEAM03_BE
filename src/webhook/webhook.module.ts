import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { CodeReviewModule } from '../review/code-review.module';

@Module({
    imports: [CodeReviewModule],
    controllers: [WebhookController],
})
export class WebhookModule { }
