import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { UserService } from '../../src/users/user.service';
import { TasksService } from '../../src/tasks/tasks.service';
import { NotFoundException } from '@nestjs/common';

let service: CommentService;
let commentRepository: Repository<Comment>;

const mockUserService = {
  findByUserName: jest.fn(),
};

const mockTasksService = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
};

const mockCommentRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  merge: jest.fn(),
};
describe('CommentService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();
    service = module.get<CommentService>(CommentService);
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
  });
 afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    it('should return all comments with user relations', async () => {
      const expectedComments = [
        {
          id: 1,
          content: 'Comment 1',
          createAt: new Date(),
          updateAt: new Date(),
          task: null,
          user: null,
        },
        {
          id: 2,
          content: 'Comment 2',
          createAt: new Date(),
          updateAt: new Date(),
          task: null,
          user: null,
        },
      ];
      mockCommentRepository.find.mockResolvedValue(expectedComments);

      const result = await service.findAll();

      expect(result).toEqual(expectedComments);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
      });
    });
  });
  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const expectedComment = {
        id: 1,
        content: 'Comment 1',
        createAt: new Date(),
        updateAt: new Date(),
        task: null,
        user: null,
      };
      mockCommentRepository.findOne.mockResolvedValue(expectedComment);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedComment);
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
    });

    it('should throw NotFoundException when comment not found by id', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
  describe('create', () => {
    it('should create a new comment', async () => {
      const commentDto = {
        content: 'New Comment',
        userName: 'user1',
        taskId: 1,
      };
      const user = { id: 1, userName: 'user1' };
      const task = { id: 1, title: 'Task 1' };
      const newComment = { ...commentDto, user, task };
      const savedComment = { id: 1, ...newComment };

      mockCommentRepository.create.mockReturnValue(newComment);
      mockCommentRepository.save.mockResolvedValue(savedComment);
      mockUserService.findByUserName.mockResolvedValue(user);
      mockTasksService.findOne.mockResolvedValue(task);

      const result = await service.create(commentDto);

      expect(result).toEqual(savedComment);
      expect(mockCommentRepository.create).toHaveBeenCalledWith(commentDto);
      expect(mockUserService.findByUserName).toHaveBeenCalledWith('user1');
      expect(mockTasksService.findOne).toHaveBeenCalledWith(1);
      expect(mockCommentRepository.save).toHaveBeenCalledWith(newComment);
    });
  });
  describe('update', () => {
    it('should update an existing comment', async () => {
      const id = 1;
      const commentDto = {
        content: 'Updated Comment',
        userName: 'user2',
        taskId: 1,
      };
      const existingComment = {
        id,
        content: 'Old Comment',
        user: { id: 1, userName: 'user1' },
      };
      const updatedUser = { id: 2, userName: 'user2' };
      const updatedTask = { id: 1, title: 'Task 1' };
      const updatedComment = {
        ...existingComment,
        ...commentDto,
        user: updatedUser,
        task: updatedTask,
      };

      mockCommentRepository.findOneBy.mockResolvedValue(existingComment);
      mockUserService.findByUserName.mockResolvedValue(updatedUser);
      mockCommentRepository.merge.mockReturnValue(updatedComment);
      mockCommentRepository.save.mockResolvedValue(updatedComment);

      const result = await service.update(id, commentDto);

      expect(mockCommentRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockUserService.findByUserName).toHaveBeenCalledWith('user2');
      expect(mockCommentRepository.merge).toHaveBeenCalledWith(
        existingComment,
        commentDto,
      );
      expect(result).toEqual(updatedComment);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete comment successfully', async () => {
      const existingComment = { id: 1, content: 'Comment to delete' };
      mockCommentRepository.findOneBy.mockResolvedValue(existingComment);
      mockCommentRepository.delete.mockResolvedValue(undefined);

      const result = await service.delete(1);

      expect(result).toEqual(existingComment);
      expect(mockCommentRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockCommentRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
