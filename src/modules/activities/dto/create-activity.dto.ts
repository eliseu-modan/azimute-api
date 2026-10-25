import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @IsString() leadId!: string;
  @IsEnum(ActivityType) type!: ActivityType;
  @IsString() @MinLength(1) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Date) @IsDate() scheduledAt?: Date;
  @IsOptional() @Type(() => Date) @IsDate() completedAt?: Date;
}
