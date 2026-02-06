import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../entities/mission.entity';
import { PullRequest, PrStatus } from '../entities/pull-request.entity';
import { ReviewLog } from '../entities/review-log.entity';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';
import { ProcessCommitInput, ProcessCommitOutput } from './dto/review.dto';
import { GetPrDiffInput, PostCommentInput } from '../github/dto/github.dto';
import {
    GenerateCodeReviewInput,
    GenerateFinalAssessmentInput,
} from '../ai/dto/ai.dto';

@Injectable()
export class CodeReviewService {
    private readonly logger = new Logger(CodeReviewService.name);

    constructor(
        @InjectRepository(Mission)
        private readonly missionRepo: Repository<Mission>,
        @InjectRepository(PullRequest)
        private readonly prRepo: Repository<PullRequest>,
        @InjectRepository(ReviewLog)
        private readonly reviewLogRepo: Repository<ReviewLog>,
        private readonly githubService: GithubService,
        private readonly aiService: AiService,
    ) { }

    async processCommit(
        input: ProcessCommitInput,
    ): Promise<ProcessCommitOutput> {
        const {
            repoOwner,
            repoName,
            prNumber,
            prUrl,
            ownerUserLogin,
            commitSha,
        } = input;
        const repoFullName = `${repoOwner}/${repoName}`;

        this.logger.log(`Processing commit for ${repoFullName} PR #${prNumber}`);

        // 1. Identify Mission
        const mission = await this.missionRepo.findOne({
            where: { repoName: repoFullName },
        });
        if (!mission) {
            this.logger.warn(`Mission not found for repo: ${repoFullName}`);
            return { success: false };
        }

        // 2. Identify/Create PR
        let pr = await this.prRepo.findOne({
            where: { githubPrUrl: prUrl },
            relations: ['mission'],
        });

        if (!pr) {
            pr = this.prRepo.create({
                mission,
                githubPrUrl: prUrl,
                prNumber,
                owner: ownerUserLogin,
                status: PrStatus.IN_PROGRESS,
            });
            await this.prRepo.save(pr);
        }

        // 3. Fetch Diff
        const diffInput: GetPrDiffInput = {
            owner: repoOwner,
            repo: repoName,
            prNumber,
        };
        const { diff: userDiff } = await this.githubService.getPrDiff(diffInput);

        // 4. AI Review
        const reviewInput: GenerateCodeReviewInput = {
            missionDesc: mission.description,
            solutionDiff: mission.solutionDiff,
            userDiff,
        };
        const reviewResult = await this.aiService.generateCodeReview(reviewInput);

        // 5. Archive ReviewLog
        const reviewLog = this.reviewLogRepo.create({
            pullRequest: pr,
            commitSha,
            userDiff,
            aiFeedback: reviewResult.feedback,
            isPassed: reviewResult.isPassed,
        });
        await this.reviewLogRepo.save(reviewLog);

        // 6. Comment Review
        const commentInput: PostCommentInput = {
            owner: repoOwner,
            repo: repoName,
            prNumber,
            body: `## AI Code Review Feedback\n\n${reviewResult.feedback}`,
        };
        await this.githubService.postComment(commentInput);

        // 7. If Passed
        if (reviewResult.isPassed) {
            const assessmentInput: GenerateFinalAssessmentInput = {
                missionDesc: mission.description,
                solutionDiff: mission.solutionDiff,
                userDiff,
            };
            const {
                assessmentReport: finalAssessment,
            } = await this.aiService.generateFinalAssessment(assessmentInput);

            pr.status = PrStatus.RESOLVED;
            pr.finalTotalAssessment = finalAssessment;
            await this.prRepo.save(pr);

            const assessmentCommentInput: PostCommentInput = {
                owner: repoOwner,
                repo: repoName,
                prNumber,
                body: finalAssessment,
            };
            await this.githubService.postComment(assessmentCommentInput);
            this.logger.log(`PR #${prNumber} passed and resolved.`);
        }

        return { success: true };
    }
}
