import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { Mission } from './mission.entity';
import { ReviewLog } from './review-log.entity';

export enum PrStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
}

@Entity()
export class PullRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Mission, (mission) => mission.pullRequests)
    mission: Mission;

    @Column()
    githubPrUrl: string;

    @Column()
    prNumber: number;

    @Column()
    owner: string;

    @Column({
        type: 'enum',
        enum: PrStatus,
        default: PrStatus.IN_PROGRESS,
    })
    status: PrStatus;

    @Column('text', { nullable: true })
    finalTotalAssessment: string;

    @OneToMany(() => ReviewLog, (review) => review.pullRequest)
    reviews: ReviewLog[];
}
