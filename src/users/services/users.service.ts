import { Injectable, HttpStatus } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { BaseException } from '../../common/exception/base.exception';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { UsersRepository } from '../users.repository';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UsersRepository,
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
}
