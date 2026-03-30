import { IsDateString, IsOptional } from 'class-validator';

export class GetOverviewDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
