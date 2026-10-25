import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '@prisma/client';
export class CreateProjectDto { @IsString() companyId!: string; @IsString() name!: string; @IsOptional() @IsString() proposalId?: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsString() ownerId?: string; @IsOptional() @IsNumber() value?: number; @IsOptional() @Type(() => Date) @IsDate() dueAt?: Date; @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus; }
export class UpdateProjectDto { @IsOptional() @IsString() name?: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsString() ownerId?: string; @IsOptional() @IsNumber() value?: number; @IsOptional() @Type(() => Date) @IsDate() dueAt?: Date; @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus; }
