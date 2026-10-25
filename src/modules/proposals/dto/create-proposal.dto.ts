import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested, IsArray, Min, ArrayMinSize } from 'class-validator';
import { ProposalStatus, ProposalPhase } from '@prisma/client';
class ProposalItemDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(ProposalPhase) phase?: ProposalPhase;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) quantity?: number;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) unitPrice!: number;
}
export class CreateProposalDto {
  @IsString() leadId!: string;
  @IsOptional() @IsEnum(ProposalStatus) status?: ProposalStatus;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() problem?: string;
  @IsOptional() @IsString() solution?: string;
  @IsOptional() @IsString() scope?: string;
  @IsOptional() @IsString() deliverables?: string;
  @IsOptional() @IsString() schedule?: string;
  @IsOptional() @IsString() paymentTerms?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ProposalItemDto) items!: ProposalItemDto[];
}

