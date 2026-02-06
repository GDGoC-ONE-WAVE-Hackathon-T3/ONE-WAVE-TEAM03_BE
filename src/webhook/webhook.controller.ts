import { Controller, Post, Body, Headers, Logger, Get } from '@nestjs/common';
import { CodeReviewService } from '../review/code-review.service';
import { GithubPrEventPayloadDto, WebhookResponseDto } from './dto/webhook.dto';
import { ProcessCommitInput } from '../review/dto/review.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly codeReviewService: CodeReviewService) { }
    @ApiOperation({ summary: 'Handle GitHub Events' })
    @ApiResponse({
        status: 201,
        description: 'Event processed',
        type: WebhookResponseDto,
    })
    @Post('github-events')
    async handleGithubEvent(
        @Body() payload: GithubPrEventPayloadDto,
        @Headers('x-github-event') eventType: string,
    ): Promise<WebhookResponseDto> {
        this.logger.log(`Received GitHub event: ${eventType}`);

        if (eventType === 'pull_request') {
            const action = payload.action;
            if (action === 'opened' || action === 'synchronize') {
                const input: ProcessCommitInput = {
                    repoOwner: payload.repository.full_name.split('/')[0],
                    repoName: payload.repository.full_name.split('/')[1],
                    prNumber: payload.number,
                    prUrl: payload.pull_request.html_url,
                    ownerUserLogin: payload.pull_request.user.login,
                    commitSha: payload.pull_request.head.sha,
                };
                await this.codeReviewService.processCommit(input);
                return { message: 'Processed pull_request event' };
            }
        }

        return { message: 'Ignored event' };
    }

    // Smoke Test Endpoint
    @ApiOperation({ summary: 'Smoke Test' })
    @ApiResponse({ status: 200, description: 'OK' })
    @Get('admin/test')
    async smokeTest(): Promise<string> {
        return 'OK';
    }
}
