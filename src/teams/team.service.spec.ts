import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../src/users/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockTeamRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  merge: jest.fn(),
};

const mockUserRepository = {
  findOneBy: jest.fn(),
};

describe('TeamService', () => {
  let service: TeamService;
  let teamRepository: Repository<Team>;
  let userRepository: Repository<User>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: getRepositoryToken(Team),
          useValue: mockTeamRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of teams', async () => {
      const teamArray = [{ id: 1, name: 'Team1', users: [], projects: [] }];
      mockTeamRepository.find.mockResolvedValue(teamArray);

      await expect(service.findAll()).resolves.toEqual(teamArray);
      expect(mockTeamRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a team if found', async () => {
      const team = { id: 1, name: 'Team1', users: [], projects: [] };
      mockTeamRepository.findOne.mockResolvedValue(team);

      await expect(service.findOne(1)).resolves.toEqual(team);
      expect(mockTeamRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['users', 'projects'],
      });
    });

    it('should throw NotFoundException if team not found', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return a team by name', async () => {
      const team = { id: 1, name: 'Team1', users: [], projects: [] };
      mockTeamRepository.findOne.mockResolvedValue(team);

      await expect(service.findByName('Team1')).resolves.toEqual(team);
      expect(mockTeamRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Team1' },
        relations: ['users', 'projects'],
      });
    });
  });

  describe('create', () => {
    it('should create and return a new team', async () => {
      const createTeamDto = { name: 'NewTeam' };
      const savedTeam = { id: 1, ...createTeamDto, users: [], projects: [] };
      mockTeamRepository.create.mockReturnValue(createTeamDto);
      mockTeamRepository.save.mockResolvedValue(savedTeam);

      await expect(service.create(createTeamDto)).resolves.toEqual(savedTeam);
      expect(mockTeamRepository.create).toHaveBeenCalledWith(createTeamDto);
      expect(mockTeamRepository.save).toHaveBeenCalledWith(createTeamDto);
    });

    it('should throw ConflictException on save error', async () => {
      const createTeamDto = { name: 'NewTeam' };
      mockTeamRepository.save.mockRejectedValue({ detail: 'Conflict' });

      await expect(service.create(createTeamDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if team not found', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { name: 'UpdatedTeam' })).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw ConflictException on save error', async () => {
      const existingTeam = { id: 1, name: 'Team1' };
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(existingTeam as never);
      jest.spyOn(teamRepository, 'save').mockRejectedValue({ detail: 'Conflict' });

      await expect(service.update(1, { name: 'UpdatedTeam' })).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete and return an existing team', async () => {
      const team = { id: 1, name: 'Team1', users: [], projects: [] };
      mockTeamRepository.findOneBy.mockResolvedValue(team);
      mockTeamRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toEqual(team);
      expect(mockTeamRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockTeamRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if team not found', async () => {
      mockTeamRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addUser', () => {
    it('should add a user to the team', async () => {
      const team = { id: 1, name: 'Team1', users: [], projects: [] };
      const user = { id: 1, userName: 'User1' };

      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(team as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as never);
      jest.spyOn(teamRepository, 'save').mockResolvedValue(team as never); // Mock save method

      const result = await service.addUser(1, 'User1');

      expect(result).toEqual(user); // Check if the returned result matches the user object
      expect(team.users).toContain(user); // Check if the user was added to the team's users array
      expect(teamRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['users', 'projects'],
      }); // Ensure findOne was called with the correct ID
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ userName: 'User1' }); // Ensure findOneBy was called with the correct username
      expect(teamRepository.save).toHaveBeenCalledWith(team); // Ensure save was called with the updated team object
    });

    it('should throw NotFoundException if team not found', async () => {
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addUser(1, 'User1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const team = { id: 1, name: 'Team1', users: [], projects: [] };
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(team as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.addUser(1, 'User1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user already added', async () => {
      const team = {
        id: 1,
        name: 'Team1',
        users: [{ id: 1, userName: 'User1' }],
        projects: [],
      };
      const user = { id: 1, userName: 'User1' };

      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(team as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as never);

      await expect(service.addUser(1, 'User1')).rejects.toThrow(ConflictException);
    });
  });

  describe('removeUser', () => {
    it('should remove a user from the team', async () => {
      const team = {
        id: 1,
        name: 'Team1',
        users: [{ id: 1, userName: 'User1' }],
        projects: [],
      };
      const user = { id: 1, userName: 'User1' };

      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(team as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as never);
      jest.spyOn(teamRepository, 'save').mockResolvedValue(team as never);

      const result = await service.removeUser(1, 'User1');

      expect(result).toEqual(user);
      expect(team.users).not.toContain(user);
      expect(teamRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['users'],
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ userName: 'User1' });
      expect(teamRepository.save).toHaveBeenCalledWith(team);
    });

    it('should throw NotFoundException if team not found', async () => {
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(null);

      await expect(service.removeUser(1, 'User1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const team = { id: 1, name: 'Team1', users: [], projects: [] };
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(team as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.removeUser(1, 'User1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found in team', async () => {
      const team = {
        id: 1,
        name: 'Team1',
        users: [{ id: 1, userName: 'User1' }],
        projects: [],
      };
      const user = { id: 1, userName: 'User1' };

      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(team as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as never);

      await expect(service.removeUser(1, 'User2')).rejects.toThrow(NotFoundException);
    });
  });
  

});
