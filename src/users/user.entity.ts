import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { Team } from '../../src/teams/team.entity';
import { Task } from '../../src/tasks/tasks.entity';
import { Comment } from '../../src/comments/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: 255 })
  userName: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @ManyToMany(() => Team, (team) => team.users, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'users_teams',
    joinColumn: {
      name: 'user_id',
    },
    inverseJoinColumn: {
      name: 'team_id',
    },
  })
  teams: Team[];

  @OneToMany(() => Task, (task) => task.responsable)
  tasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
