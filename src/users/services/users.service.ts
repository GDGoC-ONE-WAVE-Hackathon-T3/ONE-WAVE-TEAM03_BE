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

        // 1. 유저 조회 (토큰 유무 상관 없음)
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new BaseException(ERROR_CODES.USER_NOT_FOUND, '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
        }

        // 2. DB 정보 업데이트 (Backend / Java로 강제 저장됨)
        user.stack = onboardingDto.stack;     // Controller에서 이미 'Backend'로 바뀜
        user.techStack = onboardingDto.techStack; // Controller에서 이미 'Java'로 바뀜
        await this.userRepository.save(user);

        // 3. 미션 조회 (Elasticsearch 고정)
        const mission = await this.missionRepository.findOne({
            where: { repoName: 'elastic/elasticsearch' },
        });

        if (!mission) {
            throw new NotFoundException('미션을 찾을 수 없습니다.');
        }

        // 4. [핵심] 무조건 Mock Fork 실행
        // 유저의 실제 토큰 여부는 검사하지 않습니다. 개발자님의 .env 토큰으로 그냥 포크합니다.
        let forkUrl: string;
        try {
            console.log('[DEMO MODE] Executing Unconditional Mock Fork...');

            // 시연용 메서드 호출 (elastic/elasticsearch -> 내 계정으로 포크)
            forkUrl = await this.githubService.mockForkRepo();

        } catch (error) {
            console.error('Mock fork failed:', error);
            // 실패해도 시연이 멈추지 않도록 null 처리 하거나, 혹은 더미 URL을 줄 수도 있음
            forkUrl = 'https://github.com/labyrinth30/elasticsearch'; // 정 안되면 이것까지 하드코딩 가능
        }

        const botInstallUrl = `https://github.com/apps/one-wave-team3-bot`;

        return { mission, forkUrl, botInstallUrl };
    }
}
