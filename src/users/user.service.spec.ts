import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { userDto } from './user.dto';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const userArray = [
    { id: 1, userName: 'JohnDoe', teams: [], tasks: [] },
    { id: 2, userName: 'JaneDoe', teams: [], tasks: [] },
  ];

  const newUser: userDto = { userName: 'NewUser' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserRepository.find.mockResolvedValue(userArray);
      const users = await service.findAll();
      expect(users).toEqual(userArray);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ['teams', 'tasks'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(userArray[0]);
      const user = await service.findOne(1);
      expect(user).toEqual(userArray[0]);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['teams', 'tasks'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(3)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserName', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(userArray[0]);
      const user = await service.findByUserName('JohnDoe');
      expect(user).toEqual(userArray[0]);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userName: 'JohnDoe' },
        relations: ['teams', 'tasks'],
      });
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      const user = await service.create(newUser);
      expect(user).toEqual(newUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should throw ConflictException on save error', async () => {
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockRejectedValue({ detail: 'Conflict' });
      await expect(service.create(newUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return an existing user', async () => {
      const existingUser = { id: 1, userName: 'JohnDoe', teams: [], tasks: [] };
      const newUser = { userName: 'UpdatedUser' };
      const updatedUser = {
        id: 1,
        userName: 'UpdatedUser',
        teams: [],
        tasks: [],
      };

      mockUserRepository.findOneBy.mockResolvedValue(existingUser);
      mockUserRepository.merge.mockImplementation((entity, update) => {
        const merged = { ...entity, ...update };
        console.log('merge called with:', entity, update);
        console.log('merged result:', merged);
        return merged;
      });
      mockUserRepository.save.mockImplementation((user) => {
        console.log('save called with:', user);
        return Promise.resolve(user);
      });
      const user = await service.update('JohnDoe', newUser);

      expect(user).toEqual(updatedUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        userName: 'JohnDoe',
      });
      expect(mockUserRepository.merge).toHaveBeenCalledWith(
        existingUser,
        newUser,
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('NonExistentUser', { userName: 'UpdatedUser' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on save error', async () => {
      const existingUser = { id: 1, userName: 'JohnDoe', teams: [], tasks: [] };
      mockUserRepository.findOneBy.mockResolvedValue(existingUser);
      mockUserRepository.save.mockRejectedValue({ detail: 'Conflict' });

      await expect(
        service.update('JohnDoe', { userName: 'UpdatedUser' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete and return an existing user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userArray[0]);
      const user = await service.delete('JohnDoe');
      expect(user).toEqual(userArray[0]);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        userName: 'JohnDoe',
      });
      expect(mockUserRepository.delete).toHaveBeenCalledWith({
        userName: 'JohnDoe',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.delete('NonExistentUser')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
