import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { PullRequest } from './pull-request.entity';

@Entity()
export class ReviewLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PullRequest, (pr) => pr.reviews)
    pullRequest: PullRequest;

    @Column()
    commitSha: string;

    @Column('text')
    userDiff: string;

    @Column('text')
    aiFeedback: string;

    @Column()
    isPassed: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
