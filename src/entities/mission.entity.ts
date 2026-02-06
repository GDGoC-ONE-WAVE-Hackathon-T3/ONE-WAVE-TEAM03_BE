import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PullRequest } from './pull-request.entity';

@Entity()
export class Mission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    repoName: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('text')
    solutionDiff: string;

    @Column({ nullable: true })
    thumbnailUrl: string;

    @OneToMany(() => PullRequest, (pr) => pr.mission)
    pullRequests: PullRequest[];
}
