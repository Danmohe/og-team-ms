import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices/decorators';

import { TeamService } from './team.service';
import { TeamMSG } from 'src/common/constants';
import * as grpc from '@grpc/grpc-js';

import { CreateTeamRequest, EmptyRequest, TEAM_SERVICE_NAME, TeamRequest, TeamResponse, TeamsResponse, UpdateTeamRequest } from 'src/team.pb';
import { RpcException } from '@nestjs/microservices';

@ApiTags('Teams')
@Controller('api/v1/teams')
export class TeamController {
  constructor(private teamsService: TeamService) {}

  /*
  @GrpcMethod(TEAM_SERVICE_NAME, TeamMSG.FIND_ALL)
  async FindAll(): Promise<TeamsResponse> {
    try {
      const teams = await this.teamsService.findAll();
      console.log('Found all teams');
      return { teams: teams };
    } catch (error) {
      console.error('Failed to find all teams', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to find all teams',
      });
    }
  }

  @GrpcMethod(TEAM_SERVICE_NAME, TeamMSG.FIND_ONE)
  async findOne(request: TeamRequest): Promise<TeamResponse> {
    try {
      const foundTeam = await this.teamsService.findOne(Number(request.teamId));
      console.log('team found');
      return { team: foundTeam };
    } catch (error) {
      console.error('Failed to find team', error);
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'Team not found',
      });
    }
  }
  */

  @GrpcMethod(TEAM_SERVICE_NAME, TeamMSG.CREATE)
  async createUser(request: CreateTeamRequest): Promise<TeamResponse> {
    try {
      const createdTeam = await this.teamsService.create(request.teamName);
      console.log('team created');
      return {
        team: request,
      };
    } catch (error) {
      console.error('Failed to create team', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to create team',
      })

    }
  }

  /*
  @GrpcMethod(TEAM_SERVICE_NAME, TeamMSG.UPDATE)
  async update(request: UpdateTeamRequest): Promise<TeamResponse> {
    try {
      const teamId = request.teamId;
      const updatedTeam = await this.teamsService.update(Number(teamId), request);
      console.log('Team updated');
      return { team: updatedTeam };
    } catch (error) {
      console.error('Failed to update user', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to update user',
      });
    }
  }
    */

  @GrpcMethod(TeamMSG.DELETE)
  async delete(request: TeamRequest): Promise<EmptyRequest> {
    try {
      const teamId = request.teamId;
      const deleteTeam = await this.teamsService.delete(Number(teamId));
      console.log('User deleted');
      return {};
    } catch (error) {
      console.error('Failed to update user', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to update user',
      });
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
