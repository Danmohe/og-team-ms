import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';

import { TeamService } from './team.service';
import { teamDto } from './team.dto';
import { TeamMSG } from 'src/common/constants';

@ApiTags('Teams')
@Controller('api/v1/teams')
export class TeamController {
  constructor(private teamsService: TeamService) {}

  @MessagePattern(TeamMSG.FIND_ALL)
  async findAll() {
    try {
      const foundTeams = await this.teamsService.findAll();
      return {
        success: true,
        message: 'Teams found',
        data: foundTeams,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to found teams',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TeamMSG.FIND_ONE)
  async findOne(@Payload() id: number) {
    try {
      const foundTeam = await this.teamsService.findOne(id);
      return {
        success: true,
        message: 'Team found',
        data: foundTeam,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Team not found',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TeamMSG.CREATE)
  async create(@Payload() payload: teamDto) {
    try {
      const createdTeam = await this.teamsService.create(payload);
      return {
        success: true,
        message: 'Team created succesfully',
        data: createdTeam,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create team',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TeamMSG.UPDATE)
  async update(@Payload() message: { id: number; payload: teamDto }) {
    try {
      const updateTeam = await this.teamsService.update(
        message.id,
        message.payload,
      );
      return {
        success: true,
        message: 'Team updated succesfully',
        data: updateTeam,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update team',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TeamMSG.DELETE)
  async delete(@Payload() id: number) {
    try {
      const deletedTeam = await this.teamsService.delete(id);
      return {
        success: true,
        message: 'Team deleted succesfully',
        data: deletedTeam,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete team',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TeamMSG.ADD_USER)
  async addUser(@Payload() message: { id: number; userName: string }) {
    try {
      const user = await this.teamsService.addUser(
        message.id,
        message.userName,
      );
      return {
        success: true,
        message: 'User added succesfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add user',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(TeamMSG.REMOVE_USER)
  async removeUser(@Payload() message: { teamId: number; userName: string }) {
    try {
      const user = await this.teamsService.removeUser(
        message.teamId,
        message.userName,
      );
      return {
        success: true,
        message: 'User removed succesfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove user',
        error: (error as Record<string, string>)?.message,
      };
    }
  }
}
