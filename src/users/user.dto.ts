import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class userDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly userName: string;
}
