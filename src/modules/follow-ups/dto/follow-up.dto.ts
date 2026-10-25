import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { FollowUpType, FollowUpStatus } from '@prisma/client';
export class CreateFollowUpDto { @IsOptional() @IsString() leadId?: string; @IsEnum(FollowUpType) type!: FollowUpType; @Type(() => Date) @IsDate() scheduledAt!: Date; @IsOptional() @IsEnum(FollowUpStatus) status?: FollowUpStatus; @IsOptional() @IsString() description?: string; }
export class UpdateFollowUpDto { @IsOptional() @IsEnum(FollowUpType) type?: FollowUpType; @IsOptional() @Type(() => Date) @IsDate() scheduledAt?: Date; @IsOptional() @IsEnum(FollowUpStatus) status?: FollowUpStatus; @IsOptional() @IsString() description?: string; @IsOptional() @Type(() => Date) @IsDate() completedAt?: Date; }
