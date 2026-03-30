import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}
