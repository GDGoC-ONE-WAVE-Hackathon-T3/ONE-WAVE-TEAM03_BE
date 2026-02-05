import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';

export class UserResponseDto {
    @ApiProperty()
    readonly id: string;

    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    readonly username: string;

    @ApiProperty()
    readonly createdAt: Date;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.username = user.username;
        this.createdAt = user.createdAt;
    }
}
