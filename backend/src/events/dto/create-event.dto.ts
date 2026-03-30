import { IsEnum, IsISO8601, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { EventTypeEnum } from '../../database/schema';

export class CreateEventDto {
  @IsEnum(EventTypeEnum)
  eventType: EventTypeEnum;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, unknown>;

  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
