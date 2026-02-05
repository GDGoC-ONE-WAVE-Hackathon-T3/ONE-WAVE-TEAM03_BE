import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    username: string;
}
