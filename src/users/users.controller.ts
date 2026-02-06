import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { GithubService } from '../github/github.service';


class OnboardingResponseDto {
    forkUrl: string;
    botInstallUrl: string
};

class MissionStatusResponseDto {
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

    @Post('onboarding')
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
