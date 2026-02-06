import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Minimal DTO for GitHub Event Payload
export class GithubPrEventPayloadDto {
    @ApiProperty({ example: 'opened', description: 'The action performed' })
    @IsString()
    @IsNotEmpty()
    action: string;

    @ApiProperty({ description: 'Repository information' })
    @IsNotEmpty()
    repository: {
        full_name: string;
        [key: string]: any;
    };

    @ApiProperty({ description: 'Pull Request information' })
    @IsNotEmpty()
    pull_request: {
        html_url: string;
        user: {
            login: string;
        };
        head: {
            sha: string;
        };
        [key: string]: any;
    };

    @ApiProperty({ example: 123, description: 'The PR number' })
    @IsNotEmpty()
    number: number;

    @ApiProperty({ required: false, description: 'Organization info' })
    @IsObject()
    @IsOptional()
    organization?: any;

    @ApiProperty({ required: false, description: 'Sender info' })
    @IsObject()
    @IsOptional()
    sender?: any;
}

export class WebhookResponseDto {
    @ApiProperty({ example: 'Processed pull_request event', description: 'Result message' })
    @IsString()
    message: string;
}
