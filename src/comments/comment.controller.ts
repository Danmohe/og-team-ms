import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';

import { CommentService } from './comment.service';
import { CommentMSG } from 'src/common/constants';
import { commentDto } from './comment.dto';

@ApiTags('Comments')
@Controller('api/v1/comments')
export class CommentController {
  constructor(private commentsService: CommentService) {}

  @MessagePattern(CommentMSG.FIND_ALL)
  async findAll() {
    try {
      const foundComments = await this.commentsService.findAll();
      return {
        success: true,
        message: 'Comments found',
        data: foundComments,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to found comments',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(CommentMSG.FIND_ONE)
  async findOne(@Payload() id: number) {
    try {
      const foundComment = await this.commentsService.findOne(id);
      return {
        success: true,
        message: 'Comment found',
        data: foundComment,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Comment not found',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(CommentMSG.CREATE)
  async create(@Payload() payload: commentDto) {
    try {
      const createdComment = await this.commentsService.create(payload);
      return {
        success: true,
        message: 'Comment created succesfully',
        data: createdComment,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create comment',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(CommentMSG.UPDATE)
  async update(@Payload() message: { id: number; payload: commentDto }) {
    try {
      const updateComment = await this.commentsService.update(
        message.id,
        message.payload,
      );
      return {
        success: true,
        message: 'Comment updated succesfully',
        data: updateComment,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update comment',
        error: (error as Record<string, string>)?.message,
      };
    }
  }

  @MessagePattern(CommentMSG.DELETE)
  async delete(@Payload() id: number) {
    try {
      const deletedComment = await this.commentsService.delete(id);
      return {
        success: true,
        message: 'Comment deleted succesfully',
        data: deletedComment,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete comment',
        error: (error as Record<string, string>)?.message,
      };
    }
  }
}
