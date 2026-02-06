import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { GithubService } from '../github/github.service';

class OnboardingResponseDto {
    @ApiProperty({
        example: 'https://github.com/labyrinth30/elasticsearch',
        description: 'Fork URL',
    })
    forkUrl: string;
    @ApiProperty({
        example: 'https://github.com/apps/one-wave-team3-bot',
        description: 'Bot Install URL',
    })
    botInstallUrl: string
};

class MissionStatusResponseDto {
    @ApiProperty({
        example: true,
        description: 'PR Merged Status',
    })
    isMerged: boolean;
    prUrl?: string
};
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService,
        private readonly githubService: GithubService
    ) { }

    @Get('mission-status')
    @ApiOperation({ summary: '미션 완료(PR 머지) 상태 확인' })
    @ApiResponse({ status: 200, type: MissionStatusResponseDto })
    async checkMissionStatus() {
        return this.githubService.getLatestPrStatus();
    }

    @Get('onboarding')
    @ApiOperation({ summary: '온보딩' })
    @ApiResponse({ status: 200, type: OnboardingResponseDto })
    async onboarding(): Promise<{ forkUrl: string; botInstallUrl: string }> {
        // 2초 후에 값 반환
        return new Promise<{ forkUrl: string; botInstallUrl: string }>((resolve) => {
            setTimeout(() => {
                const forkUrl: string = 'https://github.com/labyrinth30/elasticsearch';
                const botInstallUrl = `https://github.com/apps/one-wave-team3-bot`;
                resolve({ forkUrl, botInstallUrl });
            }, 2000);
        });
    }
}
