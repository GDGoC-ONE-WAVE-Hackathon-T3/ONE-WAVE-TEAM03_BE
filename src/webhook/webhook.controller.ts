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

}