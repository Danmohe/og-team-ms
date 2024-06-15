import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from 'src/users/user.entity';
import { Project } from 'src/projects/projects.entity';
import { Comment } from 'src/comments/comment.entity';

enum TaskStatus {
  PENDING = 'pendiente',
  IN_PROGRESS = 'en progreso',
  COMPLETED = 'finalizada',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

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

  @ManyToOne(() => Project, (project) => project.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  project: Project;

  @ManyToOne(() => User, (user) => user.tasks, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  responsable: User;

  @ManyToOne(() => User, { nullable: false })
  creator: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
