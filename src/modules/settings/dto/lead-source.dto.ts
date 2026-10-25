import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
export class LeadSourceDto { @IsString() @MinLength(1) name!: string; @IsOptional() @IsBoolean() active?: boolean; }
