import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ActivityType } from '@prisma/client';

export class UpdateActivityDto {
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsEnum(ActivityType) type?: ActivityType;
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Date) @IsDate() scheduledAt?: Date | null;
  @IsOptional() @Type(() => Date) @IsDate() completedAt?: Date | null;
}
