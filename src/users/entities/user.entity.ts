import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    username: string;

    @Column({ nullable: true })
    stack: string; // 'Frontend' | 'Backend'

    @Column({ nullable: true })
    techStack: string; // 'Node.js' | 'Spring' | 'Python' | 'Java'

    @Column({ nullable: true, select: false })
    githubAccessToken: string;
}
