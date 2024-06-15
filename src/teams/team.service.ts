import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Repository } from 'typeorm';

import { Team } from './team.entity';
import { teamDto } from './team.dto';
import { User } from '../../src/users/user.entity'; //updated777

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.teamRepo.find({
      relations: ['users', 'projects'],
    });
  }

  async findOne(id: number) {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: ['users', 'projects'],
    });
    if (!team) {
      throw new NotFoundException(`Team #${id} not found`);
    }
    return team;
  }

  async findByName(name: string) {
    return await this.teamRepo.findOne({
      where: { name },
      relations: ['users', 'projects'],
    });
  }

  async create(payload: teamDto) {
    const newTeam = this.teamRepo.create(payload);
    return await this.teamRepo.save(newTeam).catch((error) => {
      throw new ConflictException(error.detail);
    });
  }

  async update(id: number, payload: teamDto) {
    const team = await this.teamRepo.findOne(id as any); //updated777
    if (!team) {
      throw new NotFoundException(`Team #${id} not found`);
    }
    this.teamRepo.merge(team, payload);
    return await this.teamRepo.save(team).catch((error) => {
      throw new ConflictException(error.detail);
    });
  }

  async delete(id: number) {
    const team = await this.teamRepo.findOneBy({ id });
    if (!team) {
      throw new NotFoundException(`Team #${id} not found`);
    }
    this.teamRepo.delete({ id });
    return team;
  }

  async addUser(teamId: number, userName: string) {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['users', 'projects'],
    });
    if (!team) {
      throw new NotFoundException(`Team #${teamId} not found`);
    }
    const user = await this.userRepo.findOneBy({ userName });
    if (!user) {
      throw new NotFoundException(`User ${userName} not found`);
    }
    const isUserAlreadyAdded = team.users.some(
      (existingUser) => existingUser.userName === userName,
    );
    if (isUserAlreadyAdded) {
      throw new ConflictException(
        `User ${userName} is already added to team #${teamId}`,
      );
    }
    team.users.push(user);
    this.teamRepo.save(team);
    return user;
  }

  async removeUser(teamId: number, userName: string) {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['users'],
    });
    if (!team) {
      throw new NotFoundException(`Team #${teamId} not found`);
    }
    const user = await this.userRepo.findOneBy({ userName });
    if (!user) {
      throw new NotFoundException(`User ${userName} not found`);
    }
    const userIndex = team.users.findIndex(
      (item) => item.userName === userName,
    );
    if (userIndex === -1) {
      throw new NotFoundException(
        `User ${userName} not found in team #${teamId}`,
      );
    }
    team.users.splice(userIndex, 1);
    this.teamRepo.save(team);
    return user;
  }
}
