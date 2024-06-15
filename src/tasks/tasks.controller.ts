import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';

import { TasksService } from './tasks.service';
import { TaskMSG } from 'src/common/constants';
import { taskDto, updateTaskDto, FilterTasksDto } from './tasks.dto';

@ApiTags('Tasks')
@Controller('api/v1/tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @MessagePattern(TaskMSG.FIND_ALL)
  async findAll(@Payload() params: FilterTasksDto) {
    try {
      const foundTasks = await this.tasksService.findAll(params);
      return {
        success: true,
        message: 'Tasks found',
        data: foundTasks,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to found tasks',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TaskMSG.FIND_ONE)
  async findOne(@Payload() id: number) {
    try {
      const foundTask = await this.tasksService.findOne(id);
      return {
        success: true,
        message: 'Task found',
        data: foundTask,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Task not found',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TaskMSG.CREATE)
  async create(@Payload() payload: taskDto) {
    try {
      const createdTask = await this.tasksService.create(payload);
      return {
        success: true,
        message: 'Task created succesfully',
        data: createdTask,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create task',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TaskMSG.UPDATE)
  async update(@Payload() message: { id: number; payload: updateTaskDto }) {
    try {
      const updateTask = await this.tasksService.update(
        message.id,
        message.payload,
      );
      return {
        success: true,
        message: 'Task updated succesfully',
        data: updateTask,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update task',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TaskMSG.DELETE)
  async delete(@Payload() id: number) {
    try {
      const deletedTask = await this.tasksService.delete(id);
      return {
        success: true,
        message: 'Task deleted succesfully',
        data: deletedTask,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete task',
        error: (error as Record<string, string>)?.message,
      };
    }
  }
}
