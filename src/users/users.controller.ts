import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { OnboardingDto } from './dto/request/onboarding.dto';
import { Mission } from '../entities/mission.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('admin/test')
    @ApiOperation({ summary: 'Health Check API' })
    @ApiResponse({ status: 200, description: 'Health Check' })
    async smokeTest() {
        return { status: 'OK', timestamp: new Date().toISOString() };
    }

    @Post()
    @ApiOperation({ summary: '유저 생성' })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { user } = await this.usersService.create({ createUserDto });
        return new UserResponseDto(user);
    }

    @Get()
    @ApiOperation({ summary: '모든 유저 조회' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    async findAll(): Promise<UserResponseDto[]> {
        const { users } = await this.usersService.findAll();
        return users.map((user) => new UserResponseDto(user));
    }

    @Get(':id')
    @ApiOperation({ summary: 'ID로 유저 조회' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async findOne(@Param('id') id: string): Promise<UserResponseDto> {
        const { user } = await this.usersService.findOne({ id });
        return new UserResponseDto(user);
    }

    // @Post(':id/onboarding')
    // @ApiOperation({ summary: '온보딩 (스택 선택 및 미션 배정)' })
    // @ApiResponse({ status: 200, type: Mission })
    // async onboarding(@Param('id') id: string, @Body() onboardingDto: OnboardingDto): Promise<{ mission: Mission; forkUrl?: string; botInstallUrl?: string }> {
    //     return this.usersService.onboarding({ id, onboardingDto });
    // }
    @Post(':id/onboarding')
    @ApiOperation({ summary: '온보딩 (무조건 Backend/Java/Mock 모드)' })
    @ApiResponse({ status: 200, type: Mission })
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
