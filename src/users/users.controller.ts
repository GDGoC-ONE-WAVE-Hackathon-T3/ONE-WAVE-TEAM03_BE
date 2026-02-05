import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserResponseDto } from './dto/response/user.response.dto';

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
}
