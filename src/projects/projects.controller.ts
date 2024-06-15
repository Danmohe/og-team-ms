import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';

import { ProjectsService } from './projects.service';
import { ProjectMSG } from 'src/common/constants';
import { projectDto } from './projects.dto';

@ApiTags('Projects')
@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @MessagePattern(ProjectMSG.FIND_ALL)
  async findAll() {
    try {
      const foundProjects = await this.projectsService.findAll();
      return {
        success: true,
        message: 'Projects found',
        data: foundProjects,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to found projects',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(ProjectMSG.FIND_ONE)
  async findOne(@Payload() id: number) {
    try {
      const foundProject = await this.projectsService.findOne(id);
      return {
        success: true,
        message: 'Project found',
        data: foundProject,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Project not found',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(ProjectMSG.CREATE)
  async create(@Payload() payload: projectDto) {
    try {
      const createdProject = await this.projectsService.create(payload);
      return {
        success: true,
        message: 'Project created succesfully',
        data: createdProject,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create project',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(ProjectMSG.UPDATE)
  async update(@Payload() message: { id: number; payload: projectDto }) {
    try {
      const updateProject = await this.projectsService.update(
        message.id,
        message.payload,
      );
      return {
        success: true,
        message: 'Project updated succesfully',
        data: updateProject,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update project',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(ProjectMSG.DELETE)
  async delete(@Payload() id: number) {
    try {
      const deletedProject = await this.projectsService.delete(id);
      return {
        success: true,
        message: 'Project deleted succesfully',
        data: deletedProject,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete project',
        error: (error as Record<string, string>)?.message,
      };
    }
  }
}
