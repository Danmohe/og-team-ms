import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class commentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly content: string;

  @ApiProperty()
  @IsPositive()
  @IsOptional()
  readonly taskId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly userName: string;
}
