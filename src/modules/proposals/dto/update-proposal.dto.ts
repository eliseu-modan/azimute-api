import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
export class UpdateProposalDto {
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() problem?: string;
  @IsOptional() @IsString() solution?: string;
  @IsOptional() @IsString() scope?: string;
  @IsOptional() @IsString() deliverables?: string;
  @IsOptional() @IsString() schedule?: string;
  @IsOptional() @IsString() paymentTerms?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @Type(() => Date) @IsDate() validUntil?: Date;
}
