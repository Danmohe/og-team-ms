import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Repository } from 'typeorm';

import { Project } from './projects.entity';
import { projectDto } from './projects.dto';
import { TeamService } from '../../src/teams/team.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    private TeamsService: TeamService,
  ) { }

  async findAll() {
    return this.projectRepo.find({
      relations: ['team', 'tasks'],
    });
  }

  async findOne(id: number) {
    const project = await this.projectRepo.findOne({ where: { id }, relations: ['team', 'tasks'] });
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    return project;
  }

  async findByName(name: string) {
    return await this.projectRepo.findOne({ where: { name }, relations: ['team', 'tasks'] });
  }

  async create(payload: projectDto) {
    const newProject = this.projectRepo.create(payload);
    if (payload.teamId) {
      const team = await this.TeamsService.findOne(payload.teamId);
      newProject.team = team;
    }
    return await this.projectRepo.save(newProject).catch((error) => {
      throw new ConflictException(error.detail);
    });
  }

  async update(id: number, payload: projectDto) {
    const project = await this.projectRepo.findOneBy({ id });
    if (payload.teamId) {
      const team = await this.TeamsService.findOne(payload.teamId);
      project.team = team;
    }
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    this.projectRepo.merge(project, payload);
    return await this.projectRepo.save(project).catch((error) => {
      throw new ConflictException(error.detail);
    });
  }

  async delete(id: number) {
    const project = await this.projectRepo.findOneBy({ id });
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    this.projectRepo.delete({ id });
    return project;
  }
}
