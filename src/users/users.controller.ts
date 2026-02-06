import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { GithubService } from '../github/github.service';

export class PrDiffResponseDto {
    @ApiProperty({
        description: 'GitHub PR의 Raw Diff 문자열',
        example: 'diff --git a/src/main.ts b/src/main.ts\nindex 123..456 100644\n--- a/src/main.ts\n+++ b/src/main.ts\n@@ -1,5 +1,5 @@\n- console.log("Hello");\n+ console.log("Hello World");'
    })
    diff: string;
}
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

    @Get('diff')
    @ApiOperation({ summary: 'PR diff 확인 (Mock/Demo)' })
    @ApiResponse({
        status: 200,
        description: '성공적으로 Diff를 가져옴',
        type: PrDiffResponseDto
    })
    async checkDiff(): Promise<PrDiffResponseDto> {
        // 시연용 고정값 사용 (labyrinth30/elasticsearch 기준)
        return this.githubService.getPrDiff({
            owner: 'labyrinth30',
            repo: 'elasticsearch',
            prNumber: 1 // 실제 존재하는 PR 번호 혹은 테스트용 번호
        });
    }

}
