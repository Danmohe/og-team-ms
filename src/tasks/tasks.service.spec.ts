import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './tasks.entity';
import { ProjectsService } from '../projects/projects.service';
import { UserService } from '../users/user.service';
import { FilterTasksDto, taskDto, updateTaskDto } from './tasks.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ILike } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: Repository<Task>;
  let projectService: ProjectsService;
  let userService: UserService;

  const mockTaskRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    findOneByName: jest.fn(),  // Mock for findByName
  };

  const mockProjectService = {
    findOne: jest.fn(),
  };

  const mockUserService = {
    findByUserName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    projectService = module.get<ProjectsService>(ProjectsService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('findAll', () => {
  //   it('should return an array of tasks', async () => {
  //     const result = [{ id: 1, name: 'Test Task' }];
  //     jest.spyOn(taskRepository, 'find').mockResolvedValue(result as Task[]);
  //     expect(await service.findAll()).toBe(result);
  //   });
  // });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = [{ id: 1, name: 'Test Task' }];
      jest.spyOn(taskRepository, 'find').mockResolvedValue(result as Task[]);
      expect(await service.findAll()).toBe(result);
    });

    it('should return an array of tasks with filters', async () => {
      const params: FilterTasksDto = {
        filterName: 'Test',
        filterResponsable: 'responsableUser',
        filterStatus: TaskStatus.PENDING,
        filterProject: 1,
      };
      const result = [{ id: 1, name: 'Test Task' }];
      jest.spyOn(taskRepository, 'find').mockResolvedValue(result as Task[]);

      expect(await service.findAll(params)).toBe(result);

      expect(taskRepository.find).toHaveBeenCalledWith({
        relations: ['project', 'responsable', 'creator', 'comments'],
        where: {
          name: ILike(`%${params.filterName}%`),
          status: params.filterStatus,
          responsable: { userName: params.filterResponsable },
          project: { id: params.filterProject },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const result = { id: 1, name: 'Test Task' };
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(result as Task);
      expect(await service.findOne(1)).toBe(result);
    });

    it('should throw a NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(undefined);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return a single task by name', async () => {
      const task = { id: 1, name: 'Test Task' };
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(task as Task);
      expect(await service.findByName('Test Task')).toBe(task);
    });

    it('should return undefined if task not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(undefined);
      expect(await service.findByName('Test Task')).toBe(undefined);
    });

  });
  

  describe('create', () => {
    it('should create a new task', async () => {
      const dto: taskDto = { name: 'New Task', description: 'New Description', projectId: 1, creatorUser: 'testuser', responsableUser: 'test'  };
      const result = { id: 1, ...dto };
      jest.spyOn(taskRepository, 'create').mockReturnValue(result as any);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(result as any);
      jest.spyOn(projectService, 'findOne').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(userService, 'findByUserName').mockResolvedValue({ userName: 'testuser' } as any);

      expect(await service.create(dto)).toBe(result);
    });

    it('should throw a ConflictException if there is a conflict', async () => {
      const dto: taskDto = { name: 'New Task', description: 'New Description', projectId: 1, creatorUser: 'testuser', responsableUser: 'test' };
      jest.spyOn(taskRepository, 'create').mockReturnValue(dto as any);
      jest.spyOn(taskRepository, 'save').mockRejectedValue(new ConflictException('Conflict'));

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // describe('update', () => {
  //   it('should update a task', async () => {
  //     const dto: updateTaskDto = { name: 'Updated Task' };
  //     const task = { id: 1, name: 'Old Task' };
  //     const result = { ...task, ...dto };
  //     jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task as Task);
  //     jest.spyOn(taskRepository, 'save').mockResolvedValue(result as any);
  //     jest.spyOn(taskRepository, 'merge').mockReturnValue(result as any);

  //     expect(await service.update(1, dto)).toBe(result);
  //   });

  //   it('should throw a NotFoundException if task not found', async () => {
  //     const dto: updateTaskDto = { name: 'Updated Task' };
  //     jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(undefined);

  //     await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw a ConflictException if there is a conflict', async () => {
  //     const dto: updateTaskDto = { name: 'Updated Task' };
  //     const task = { id: 1, name: 'Old Task' };
  //     jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task as Task);
  //     jest.spyOn(taskRepository, 'save').mockRejectedValue(new ConflictException('Conflict'));

  //     await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
  //   });
  // });

  describe('update', () => {
    it('should update a task', async () => {
      const dto: updateTaskDto = { name: 'Updated Task' };
      const task = { id: 1, name: 'Old Task' };
      const result = { ...task, ...dto };
      jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task as Task);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(result as any);
      jest.spyOn(taskRepository, 'merge').mockReturnValue(result as any);

      expect(await service.update(1, dto)).toBe(result);
    });

    it('should throw a NotFoundException if task not found', async () => {
      const dto: updateTaskDto = { name: 'Updated Task' };
      jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw a ConflictException if there is a conflict', async () => {
      const dto: updateTaskDto = { name: 'Updated Task' };
      const task = { id: 1, name: 'Old Task' };
      jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task as Task);
      jest.spyOn(taskRepository, 'save').mockRejectedValue(new ConflictException('Conflict'));

      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
    });

    it('should update the responsable user of a task', async () => {
      const dto: updateTaskDto = { responsableUser: 'newUser' };
      const task = { id: 1, name: 'Old Task' };
      const updatedTask = { ...task, responsable: { userName: 'newUser' } };
      jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task as Task);
      jest.spyOn(userService, 'findByUserName').mockResolvedValue({ userName: 'newUser' } as any);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(updatedTask as any);
      jest.spyOn(taskRepository, 'merge').mockReturnValue(updatedTask as any);

      expect(await service.update(1, dto)).toBe(updatedTask);

      expect(userService.findByUserName).toHaveBeenCalledWith('newUser');
      expect(taskRepository.save).toHaveBeenCalledWith(updatedTask);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const task = { id: 1, name: 'Test Task', deleted: false };
      const result = { ...task, deleted: true };
      jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task as Task);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(result as Task);

      expect(await service.delete(1)).toBe(result);
    });

    it('should throw a NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
