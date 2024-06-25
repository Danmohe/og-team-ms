import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GrpcMethod } from '@nestjs/microservices/decorators';

import { UserService } from './user.service';
import { UserMSG } from 'src/common/constants';
import * as grpc from '@grpc/grpc-js';

import { USER_SERVICE_NAME, CreateUserRequest, UserResponse, UsersResponse, UserRequest, UpdateUserRequest,DeleteUserRequest, EmptyRequest} from './../team.pb';
import { RpcException } from '@nestjs/microservices';

@ApiTags('Users')
@Controller('api/v1/users')
export class UserController {
  constructor(private usersService: UserService) {}

  @GrpcMethod(USER_SERVICE_NAME, UserMSG.CREATE)
  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    try {
      const createdUser = await this.usersService.create(request);
      console.log('user created');
      return {
        user: createdUser,
      };
    } catch (error) {
      console.error('Failed to create user', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to create user',
      })

    }
  }

  @GrpcMethod(USER_SERVICE_NAME, UserMSG.FIND_ALL)
  async findAllUsers(): Promise<UsersResponse> {
    try {
      const users = await this.usersService.findAll();
      console.log('Found all users');
      return { users };
    } catch (error) {
      console.error('Failed to find all users', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to find all users',
      });
    }
  }

  @GrpcMethod(USER_SERVICE_NAME, UserMSG.FIND_ONE)
  async findOne(request: UserRequest): Promise<UserResponse> {
    try {
      const foundUser = await this.usersService.findOne(Number(request.userId));
      console.log('User found');
      return { user: foundUser };
    } catch (error) {
      console.error('Failed to find user', error);
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'User not found',
      });
    }
  }

  @GrpcMethod(USER_SERVICE_NAME, UserMSG.UPDATE)
  async update(request: UpdateUserRequest): Promise<UserResponse> {
    try {
      const userName = request.userName;
      const updatedUser = await this.usersService.update(userName, request);
      console.log('User updated');
      return { user: updatedUser };
    } catch (error) {
      console.error('Failed to update user', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to update user',
      });
    }
  }

  @GrpcMethod(USER_SERVICE_NAME, UserMSG.DELETE)
  async delete(request: DeleteUserRequest): Promise<EmptyRequest> {
    try {
      const userName = request.userName;
      const deleteUser = await this.usersService.delete(userName);
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
}
