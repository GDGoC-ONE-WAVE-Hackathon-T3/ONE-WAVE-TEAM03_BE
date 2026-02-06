import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { BaseException } from '../../common/exception/base.exception';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { UsersRepository } from '../users.repository';
import { Mission } from '../../entities/mission.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OnboardingDto } from '../dto/request/onboarding.dto';
import { GithubService } from '../../github/github.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UsersRepository,
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
        private readonly githubService: GithubService,
        private readonly configService: ConfigService,
    ) { }

    async create(params: { createUserDto: CreateUserDto }): Promise<{ user: User }> {
        const { createUserDto } = params;
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new BaseException(
                ERROR_CODES.USER_ALREADY_EXISTS,
                '이미 존재하는 사용자입니다.',
                HttpStatus.CONFLICT,
            );
        }

        const user = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(user);

        return { user: savedUser };
    }

    async findAll(): Promise<{ users: User[] }> {
        const users = await this.userRepository.find();
        return { users };
    }

    async findOne(params: { id: string }): Promise<{ user: User }> {
        const { id } = params;

        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new BaseException(
                ERROR_CODES.USER_NOT_FOUND,
                '사용자를 찾을 수 없습니다.',
                HttpStatus.NOT_FOUND,
            );
        }
        return { user };
    }

    async onboarding(params: { id: string; onboardingDto: OnboardingDto }): Promise<{ mission: Mission; forkUrl?: string; botInstallUrl?: string }> {
        const { id, onboardingDto } = params;

        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'email', 'username', 'githubAccessToken', 'stack', 'techStack'], // Explicitly select githubAccessToken
        });
        if (!user) {
            throw new BaseException(
                ERROR_CODES.USER_NOT_FOUND,
                '사용자를 찾을 수 없습니다.',
                HttpStatus.NOT_FOUND,
            );
        }

        user.stack = onboardingDto.stack;
        user.techStack = onboardingDto.techStack;
        await this.userRepository.save(user);

        // Always return the specific elasticsearch mission
        const mission = await this.missionRepository.findOne({
            where: { repoName: 'elastic/elasticsearch' },
        });

        if (!mission) {
            throw new NotFoundException('미션을 찾을 수 없습니다.');
        }

        let forkUrl: string | undefined;
        if (user.githubAccessToken) {
            try {
                forkUrl = await this.githubService.forkRepo(user.githubAccessToken, mission.repoName);
            } catch (error) {
                console.error('Auto-fork failed:', error);
                // Continue without failing the request, frontend can handle or retry
            }
        }

        const botInstallUrl = `https://github.com/apps/one-wave-team3-bot`;

        return { mission, forkUrl, botInstallUrl };
    }
}
