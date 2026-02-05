import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: '사용자 이메일' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'johndoe', description: '사용자 이름' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    username: string;
}
