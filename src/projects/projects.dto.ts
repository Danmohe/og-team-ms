import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class projectDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiProperty()
  @IsPositive()
  @IsOptional()
  readonly teamId: number;
}
