import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './users/user.controller';
import { UserService } from './users/user.service';
import { TeamController } from './teams/team.controller';
import { TeamService } from './teams/team.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import config from './config';
import { User } from './users/user.entity';
import { Team } from './teams/team.entity';
import { Project } from './projects/projects.entity';
import { Task } from './tasks/tasks.entity';
import { Comment } from './comments/comment.entity';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { CommentController } from './comments/comment.controller';
import { CommentService } from './comments/comment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { user, host, dbName, password, port } = configService.postgres;
        return {
          type: 'postgres',
          host,
          port,
          username: user,
          password,
          database: dbName,
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forFeature([User, Team, Project, Task, Comment]),
  ],
  controllers: [
    AppController,
    UserController,
    TeamController,
    ProjectsController,
    TasksController,
    CommentController,
  ],
  providers: [
    AppService,
    UserService,
    TeamService,
    ProjectsService,
    TasksService,
    CommentService,
  ],
})
export class AppModule {}
