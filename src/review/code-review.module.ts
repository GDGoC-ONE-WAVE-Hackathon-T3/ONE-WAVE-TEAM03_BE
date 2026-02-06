import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeReviewService } from './code-review.service';
import { Mission } from '../entities/mission.entity';
import { PullRequest } from '../entities/pull-request.entity';
import { ReviewLog } from '../entities/review-log.entity';
import { GithubModule } from '../github/github.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Mission, PullRequest, ReviewLog]),
        GithubModule,
        AiModule,
    ],
    providers: [CodeReviewService],
    exports: [CodeReviewService],
})
export class CodeReviewModule { }
