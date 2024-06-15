import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Repository } from 'typeorm';

import { UserService } from '../../src/users/user.service';
import { TasksService } from '../../src/tasks/tasks.service';

import { Comment } from './comment.entity';
import { commentDto } from './comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    private TaskService: TasksService,
    private UsersService: UserService,
  ) {}

  async findAll() {
    return this.commentRepo.find({
      relations: ['user'],
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }
    return comment;
  }

  async create(payload: commentDto) {
    const newComment = this.commentRepo.create(payload);
    if (payload.userName) {
      const user = await this.UsersService.findByUserName(payload.userName);
      newComment.user = user;
    }
    if (payload.taskId) {
      const task = await this.TaskService.findOne(payload.taskId);
      newComment.task = task;
    }
    return await this.commentRepo.save(newComment).catch((error) => {
      throw new ConflictException(error.detail);
    });
  }

  async update(id: number, payload: commentDto) {
    const comment = await this.commentRepo.findOneBy({ id });
    if (payload.userName) {
      const user = await this.UsersService.findByUserName(payload.userName);
      comment.user = user;
    }
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }
    this.commentRepo.merge(comment, payload);
    return await this.commentRepo.save(comment).catch((error) => {
      throw new ConflictException(error.detail);
    });
  }

  async delete(id: number) {
    const comment = await this.commentRepo.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }
    this.commentRepo.delete({ id });
    return comment;
  }
}
