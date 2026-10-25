import { IsEnum, IsOptional, IsString, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { LeadStatus } from '@prisma/client';
export class LeadQueryDto {
 @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
 @IsOptional() @IsString() assignedTo?: string;
 @IsOptional() @IsString() stageId?: string;
 @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
 @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
 @IsOptional() @IsString() search?: string;
 @IsOptional() @IsString() sort?: string;
 @IsOptional() @IsString() order?: string;
}
