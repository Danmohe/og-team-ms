import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { Project } from './projects.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamService } from '../teams/team.service';
import { TasksService } from '../tasks/tasks.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockTeamService = {
  findOne: jest.fn(),
};

const mockProjectRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  merge: jest.fn(),
};

const mockTasksService = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: Repository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: TeamService,
          useValue: mockTeamService,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all projects with team and tasks relations', async () => {
      // Mock data
      const projects = [
        { id: 1, name: 'Project 1', team: { id: 1, name: 'Team 1' }, tasks: [] },
        { id: 2, name: 'Project 2', team: { id: 2, name: 'Team 2' }, tasks: [] },
      ];
      // Mock repository behavior
      mockProjectRepository.find.mockResolvedValue(projects);

      // Execute the method
      const result = await service.findAll();

      // Verify the result
      expect(result).toEqual(projects);
      expect(mockProjectRepository.find).toHaveBeenCalledWith({ relations: ['team', 'tasks'] });
    });
  });
  describe('findOne', () => {
    it('should return a project with team and tasks relations', async () => {
      // Mock data
      const project = { id: 1, name: 'Project 1', team: { id: 1, name: 'Team 1' }, tasks: [] };
      // Mock repository behavior
      mockProjectRepository.findOne.mockResolvedValue(project);

      // Execute the method
      const result = await service.findOne(1);

      // Verify the result
      expect(result).toEqual(project);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['team', 'tasks'] });
    });
  });
  describe('findByName', () => {
    it('should return a project by name with team and tasks relations', async () => {
      // Mock data
      const project = { id: 1, name: 'Project 1', team: { id: 1, name: 'Team 1' }, tasks: [] };
      
      // Mock repository behavior
      mockProjectRepository.findOne.mockResolvedValue(project);
      
      // Execute the method
      const result = await service.findByName('Project 1');
      
      // Verify the result
      expect(result).toEqual(project);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Project 1' }, relations: ['team', 'tasks'] });
    });
  
    it('should return undefined if project is not found', async () => {
      // Mock data
      const projectName = 'Nonexistent Project';
      
      // Mock repository behavior
      mockProjectRepository.findOne.mockResolvedValue(undefined);
      
      // Execute the method
      const result = await service.findByName(projectName);
      
      // Verify the result
      expect(result).toBeUndefined();
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({ where: { name: projectName }, relations: ['team', 'tasks'] });
    });
  });
describe('create', () => {
  it('should create a new project', async () => {
    // Mock data
    const projectDto = { name: 'New Project', teamId: 1 };
    const newProject = { id: 1, ...projectDto, team: { id: 1, name: 'Team 1' } };
    
    // Mock repository behavior
    mockProjectRepository.create.mockReturnValue(newProject);
    mockTeamService.findOne.mockResolvedValue(newProject.team);
    mockProjectRepository.save.mockResolvedValue(newProject);
    
    // Execute the method
    const result = await service.create(projectDto);
    
    // Verify the result
    expect(result).toEqual(newProject);
    expect(mockProjectRepository.create).toHaveBeenCalledWith(projectDto);
    expect(mockTeamService.findOne).toHaveBeenCalledWith(projectDto.teamId);
    expect(mockProjectRepository.save).toHaveBeenCalledWith(newProject);
  });

  it('should throw ConflictException if save operation fails', async () => {
    // Mock data
    const projectDto = { name: 'New Project', teamId: 1 };
    const newProject = { id: 1, ...projectDto, team: { id: 1, name: 'Team 1' } };
    
    // Mock repository behavior
    mockProjectRepository.create.mockReturnValue(newProject);
    mockTeamService.findOne.mockResolvedValue(newProject.team);
    mockProjectRepository.save.mockRejectedValue({ detail: 'Save operation failed' });
    
    // Execute the method and verify it throws an exception
    await expect(service.create(projectDto)).rejects.toThrow(ConflictException);
    expect(mockProjectRepository.create).toHaveBeenCalledWith(projectDto);
    expect(mockTeamService.findOne).toHaveBeenCalledWith(projectDto.teamId);
      expect(mockProjectRepository.save).toHaveBeenCalledWith(newProject);
  });
});
describe('update', () => {
  it('should update an existing project', async () => {
    // Mock data
    const id = 1;
    const existingProject = { id, name: 'Old Project', team: { id: 1, name: 'Team 1' } };
    const projectDto = { name: 'Updated Project', teamId: 2 };
    const updatedTeam = { id: 2, name: 'Team 2' };
    const updatedProject = { ...existingProject, name: projectDto.name, team: updatedTeam };
    console.log(updatedProject);
    // Mock repository behavior
    mockProjectRepository.findOneBy.mockResolvedValue(existingProject);
    mockTeamService.findOne.mockResolvedValue(updatedTeam);
    mockProjectRepository.save.mockResolvedValue(updatedProject);
    mockProjectRepository.merge.mockImplementation((existing, updates) => ({
      ...existing,
      ...updates,
      team: updatedTeam
    }));
  

    // Execute the method
    const result = await service.update(id, projectDto);

    // Verify the result
    expect(result).toEqual(updatedProject);
    expect(mockProjectRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockTeamService.findOne).toHaveBeenCalledWith(projectDto.teamId);
    expect(mockProjectRepository.merge).toHaveBeenCalledWith(existingProject, projectDto);

  });

  it('should throw ConflictException if save operation fails', async () => {
    // Mock data
    const id = 1;
    const existingProject = { id, name: 'Old Project', team: { id: 1, name: 'Team 1' } };
    const projectDto = { name: 'Updated Project', teamId: 2 };
    
    // Mock repository behavior
    mockProjectRepository.findOneBy.mockResolvedValue(existingProject);
    mockTeamService.findOne.mockResolvedValue({ id: 2, name: 'Team 2' });
    mockProjectRepository.merge.mockReturnValue({ ...existingProject, ...projectDto });
    mockProjectRepository.save.mockRejectedValue({ detail: 'Save operation failed' });

    // Execute the method and expect it to throw
    await expect(service.update(id, projectDto)).rejects.toThrow(ConflictException);
  });
});
describe('delete', () => {
  it('should delete an existing project', async () => {
    const id = 1;
    const existingProject = { id, name: 'Project to Delete', team: { id: 1, name: 'Team 1' } };
    
    mockProjectRepository.findOneBy.mockResolvedValue(existingProject);
    mockProjectRepository.delete.mockResolvedValue(undefined);

    const result = await service.delete(id);

    expect(result).toEqual(existingProject);
    expect(mockProjectRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockProjectRepository.delete).toHaveBeenCalledWith({ id });
  });

  it('should throw NotFoundException if project not found', async () => {
    const id = 999;
    
    mockProjectRepository.findOneBy.mockResolvedValue(null);

    await expect(service.delete(id)).rejects.toThrow(NotFoundException);
    expect(mockProjectRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockProjectRepository.delete).not.toHaveBeenCalled();
  });
});
});