import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Mission } from '../entities/mission.entity';
import { UsersRepository } from './users.repository';
import { GithubModule } from '../github/github.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, Mission]), GithubModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService],
})
export class UsersModule { }
