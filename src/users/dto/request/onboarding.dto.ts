import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class OnboardingDto {
    @ApiProperty({
        example: 'Backend',
        description: 'Development Stack (Frontend | Backend)',
    })
    @IsNotEmpty()
    @IsEnum(['Frontend', 'Backend'])
    stack: string;

    @ApiProperty({
        example: 'Node.js',
        description: 'Tech Stack (Node.js | Spring | Python | Java)',
    })
    @IsNotEmpty()
    @IsEnum(['Node.js', 'Spring', 'Python', 'Java'])
    techStack: string;
}
